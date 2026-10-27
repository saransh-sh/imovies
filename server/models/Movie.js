const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Movie title is required'],
      trim: true,
    },
    genre: {
      type: String,
      required: [true, 'Genre is required'],
    },
    language: {
      type: String,
      default: 'English',
    },
    duration: {
      type: Number,
      required: [true, 'Duration in minutes is required'],
    },
    rating: {
      type: String,
      default: 'N/A',
    },
    posterUrl: {
      type: String,
      required: [true, 'Poster URL is required'],
    },
    description: {
      type: String,
      default: '',
    },
    releaseDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Movie', movieSchema);
