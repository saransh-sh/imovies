const express = require('express');
const router = express.Router();
const Showtime = require('../models/Showtime');

// GET /api/showtimes/:id - Get showtime details + populated movie + booked seats
router.get('/:id', async (req, res) => {
  try {
    const showtime = await Showtime.findById(req.params.id).populate('movieId');
    if (!showtime) {
      return res.status(404).json({
        success: false,
        message: 'Showtime not found',
      });
    }

    return res.status(200).json({
      success: true,
      showtime,
    });
  } catch (error) {
    console.error('Fetch showtime error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve showtime details',
      error: error.message,
    });
  }
});

module.exports = router;
