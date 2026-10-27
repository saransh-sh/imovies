const express = require('express');
const router = express.Router();
const Movie = require('../models/Movie');
const Showtime = require('../models/Showtime');

const mongoose = require('mongoose');

// Helper to escape regex special characters
const escapeRegex = (text) => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

// GET /api/movies - List all movies
router.get('/', async (req, res) => {
  try {
    const { genre, search } = req.query;
    let query = {};

    if (genre && genre !== 'All' && typeof genre === 'string') {
      query.genre = new RegExp(escapeRegex(genre.trim()), 'i');
    }

    if (search && typeof search === 'string' && search.trim()) {
      query.title = new RegExp(escapeRegex(search.trim()), 'i');
    }

    const movies = await Movie.find(query).sort({ releaseDate: -1 });
    return res.status(200).json({
      success: true,
      count: movies.length,
      movies,
    });
  } catch (error) {
    console.error('Fetch movies error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve movies',
      error: error.message,
    });
  }
});

// GET /api/movies/:id - Get single movie and its available showtimes
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found',
      });
    }

    const movie = await Movie.findById(id);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found',
      });
    }

    // Find all showtimes for this movie
    const showtimes = await Showtime.find({ movieId: movie._id }).sort({ date: 1, time: 1 });

    return res.status(200).json({
      success: true,
      movie,
      showtimes,
    });
  } catch (error) {
    console.error('Fetch single movie error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve movie details',
      error: error.message,
    });
  }
});

module.exports = router;
