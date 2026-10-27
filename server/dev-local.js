require('dotenv').config();
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('./server');
const Movie = require('./models/Movie');
const Showtime = require('./models/Showtime');
const User = require('./models/User');
const Booking = require('./models/Booking');
const { sampleMovies } = require('./seed/seed');
const bcrypt = require('bcryptjs');

const PORT = process.env.PORT || 5000;

async function startLocalServer() {
  let mongoUri = process.env.MONGO_URI;
  let isMemoryDb = false;

  console.log('----------------------------------------------------');
  console.log('🎬 [IMovies Local Dev Server] Starting up...');
  console.log('----------------------------------------------------');

  try {
    // Attempt connecting to the configured MONGO_URI with a short timeout
    console.log(`[Database] Attempting connection to ${mongoUri}...`);
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2000 });
    console.log('[Database] Connected to external/local MongoDB successfully!');
  } catch (err) {
    console.log('[Database] External MongoDB not active. Launching built-in In-Memory MongoDB...');
    try {
      const mongod = await MongoMemoryServer.create();
      mongoUri = mongod.getUri();
      isMemoryDb = true;
      process.env.MONGO_URI = mongoUri;
      await mongoose.connect(mongoUri);
      console.log(`[Database] In-Memory MongoDB running at: ${mongoUri}`);
    } catch (memErr) {
      console.error('[Database Fatal] Could not start In-Memory MongoDB:', memErr.message);
      process.exit(1);
    }
  }

  // Seed data if database is empty
  const movieCount = await Movie.countDocuments();
  if (movieCount === 0) {
    console.log('[Seed] Database is fresh — seeding initial movies, showtimes, and demo accounts...');
    
    // Seed users
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    const hashedAdminPassword = await bcrypt.hash('admin123', salt);

    const demoUser = await User.create({
      name: 'Neo User',
      email: 'demo@imovies.com',
      password: hashedPassword,
      role: 'user',
    });

    await User.create({
      name: 'System Admin',
      email: 'admin@imovies.com',
      password: hashedAdminPassword,
      role: 'admin',
    });

    // Seed movies
    const insertedMovies = await Movie.insertMany(sampleMovies);
    console.log(`[Seed] Seeded ${insertedMovies.length} movies.`);

    // Seed showtimes
    const showtimes = [];
    const times = ['10:30 AM', '02:15 PM', '05:45 PM', '08:30 PM', '10:45 PM'];
    const halls = ['Screen 1 (IMAX)', 'Screen 2 (Dolby Atmos)', 'Screen 3 (Standard)'];
    const prices = [250, 350, 450];
    const today = new Date();

    for (let i = 0; i < insertedMovies.length; i++) {
      const movie = insertedMovies[i];
      for (let dayOffset = 0; dayOffset < 2; dayOffset++) {
        const showDate = new Date(today);
        showDate.setDate(today.getDate() + dayOffset);
        showDate.setHours(0, 0, 0, 0);

        const timeSlot = times[(i + dayOffset) % times.length];
        const hall = halls[(i + dayOffset) % halls.length];
        const price = prices[i % prices.length];
        const booked = dayOffset === 0 ? ['A1', 'A2', 'C4', 'C5'] : ['B3', 'B4'];

        showtimes.push({
          movieId: movie._id,
          date: showDate,
          time: timeSlot,
          hall: hall,
          totalSeats: 40,
          price: price,
          bookedSeats: booked,
        });
      }
    }

    const insertedShowtimes = await Showtime.insertMany(showtimes);
    console.log(`[Seed] Seeded ${insertedShowtimes.length} showtimes.`);

    // Seed initial demo booking
    if (insertedShowtimes.length > 0) {
      await Booking.create({
        userId: demoUser._id,
        showtimeId: insertedShowtimes[0]._id,
        seats: ['A1', 'A2'],
        totalAmount: insertedShowtimes[0].price * 2,
        status: 'confirmed',
      });
      console.log('[Seed] Seeded initial demo booking for demo@imovies.com.');
    }
  } else {
    console.log(`[Database] Found ${movieCount} existing movies in database. Ready!`);
  }

  // Start Express HTTP Server
  app.listen(PORT, () => {
    console.log('----------------------------------------------------');
    console.log(`🚀 IMovies REST API ready at: http://localhost:${PORT}`);
    console.log(`   Health Check: http://localhost:${PORT}/api/health`);
    console.log(`   Movies API:   http://localhost:${PORT}/api/movies`);
    console.log('----------------------------------------------------');
  });
}

startLocalServer();
