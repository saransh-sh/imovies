const mongoose = require('mongoose');

const showtimeSchema = new mongoose.Schema(
  {
    movieId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true, // e.g. "19:30" or "7:30 PM"
    },
    hall: {
      type: String,
      default: 'Screen 1',
    },
    totalSeats: {
      type: Number,
      default: 40,
    },
    price: {
      type: Number,
      required: true, // e.g. 250
    },
    bookedSeats: [
      {
        type: String, // e.g. "A1", "C4"
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Showtime', showtimeSchema);
