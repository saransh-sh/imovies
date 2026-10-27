const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Showtime = require('../models/Showtime');
const authMiddleware = require('../middleware/auth');

const mongoose = require('mongoose');

// All booking routes require authentication
router.use(authMiddleware);

// Valid seat format: letter row + number column (e.g. A1, E8, C10)
const SEAT_REGEX = /^[A-Z][0-9]{1,2}$/;

// POST /api/bookings - Create booking with race condition prevention
router.post('/', async (req, res) => {
  let reservedSeats = null;
  let showtimeTargetId = null;

  try {
    const { showtimeId, seats } = req.body;
    const userId = req.user.id;

    if (!showtimeId || !mongoose.Types.ObjectId.isValid(showtimeId)) {
      return res.status(400).json({
        success: false,
        message: 'A valid Showtime ID is required',
      });
    }

    if (!seats || !Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Showtime ID and at least one seat selection are required',
      });
    }

    // Sanitize and validate seat codes
    const normalizedSeats = seats.map((s) => (typeof s === 'string' ? s.trim().toUpperCase() : ''));
    if (normalizedSeats.some((s) => !s || !SEAT_REGEX.test(s))) {
      return res.status(400).json({
        success: false,
        message: 'One or more selected seat identifiers are invalid (e.g. A1, B4)',
      });
    }

    // Check for duplicate seat selections within the request itself
    const uniqueSeats = Array.from(new Set(normalizedSeats));
    if (uniqueSeats.length !== normalizedSeats.length) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate seats detected in selection. Each seat may only be chosen once.',
      });
    }

    // Verify showtime exists
    const showtime = await Showtime.findById(showtimeId);
    if (!showtime) {
      return res.status(404).json({
        success: false,
        message: 'Showtime not found',
      });
    }

    // Atomic update: only book if NONE of the selected seats are already in bookedSeats
    showtimeTargetId = showtimeId;
    const updatedShowtime = await Showtime.findOneAndUpdate(
      {
        _id: showtimeId,
        bookedSeats: { $nin: uniqueSeats },
      },
      {
        $push: { bookedSeats: { $each: uniqueSeats } },
      },
      { new: true }
    );

    if (!updatedShowtime) {
      return res.status(409).json({
        success: false,
        message: 'One or more selected seats have already been booked. Please pick other seats.',
      });
    }

    reservedSeats = uniqueSeats;
    const totalAmount = uniqueSeats.length * showtime.price;

    const booking = new Booking({
      userId,
      showtimeId,
      seats: uniqueSeats,
      totalAmount,
      status: 'confirmed',
    });

    await booking.save();

    // Populate for clean response
    const populatedBooking = await Booking.findById(booking._id).populate({
      path: 'showtimeId',
      populate: { path: 'movieId' },
    });

    return res.status(201).json({
      success: true,
      message: 'Booking confirmed successfully!',
      booking: populatedBooking,
    });
  } catch (error) {
    console.error('Create booking error:', error);

    // Rollback reserved seats if booking save failed unexpectedly
    if (reservedSeats && showtimeTargetId) {
      try {
        await Showtime.findByIdAndUpdate(showtimeTargetId, {
          $pull: { bookedSeats: { $in: reservedSeats } },
        });
      } catch (rollbackErr) {
        console.error('Seat rollback failure:', rollbackErr);
      }
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to create booking',
      error: error.message,
    });
  }
});

// GET /api/bookings/me - List all bookings for current user
router.get('/me', async (req, res) => {
  try {
    const userId = req.user.id;
    const bookings = await Booking.find({ userId })
      .populate({
        path: 'showtimeId',
        populate: { path: 'movieId' },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error('Fetch user bookings error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve bookings',
      error: error.message,
    });
  }
});

// PATCH /api/bookings/:id/cancel - Soft cancel booking & free seats
router.patch('/:id/cancel', async (req, res) => {
  try {
    const bookingId = req.params.id;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Verify ownership
    if (booking.userId.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to cancel this booking',
      });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'This booking has already been cancelled',
      });
    }

    // Free the seats from the showtime
    await Showtime.findByIdAndUpdate(booking.showtimeId, {
      $pull: { bookedSeats: { $in: booking.seats } },
    });

    booking.status = 'cancelled';
    await booking.save();

    const populatedBooking = await Booking.findById(booking._id).populate({
      path: 'showtimeId',
      populate: { path: 'movieId' },
    });

    return res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully. Seats have been released.',
      booking: populatedBooking,
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to cancel booking',
      error: error.message,
    });
  }
});

module.exports = router;
