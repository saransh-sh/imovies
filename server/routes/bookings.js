const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Showtime = require('../models/Showtime');
const authMiddleware = require('../middleware/auth');

// All booking routes require authentication
router.use(authMiddleware);

// POST /api/bookings - Create booking with race condition prevention
router.post('/', async (req, res) => {
  try {
    const { showtimeId, seats } = req.body;
    const userId = req.user.id;

    if (!showtimeId || !seats || !Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Showtime ID and at least one seat selection are required',
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
    const updatedShowtime = await Showtime.findOneAndUpdate(
      {
        _id: showtimeId,
        bookedSeats: { $nin: seats },
      },
      {
        $push: { bookedSeats: { $each: seats } },
      },
      { new: true }
    );

    if (!updatedShowtime) {
      return res.status(409).json({
        success: false,
        message: 'One or more selected seats have already been booked. Please pick other seats.',
      });
    }

    const totalAmount = seats.length * showtime.price;

    const booking = new Booking({
      userId,
      showtimeId,
      seats,
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
