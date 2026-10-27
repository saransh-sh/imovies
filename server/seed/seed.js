require('dotenv').config();
const mongoose = require('mongoose');
const Movie = require('../models/Movie');
const Showtime = require('../models/Showtime');
const User = require('../models/User');
const Booking = require('../models/Booking');

const sampleMovies = [
  {
    title: 'Interstellar',
    genre: 'Sci-Fi',
    language: 'English',
    duration: 169,
    rating: '8.7',
    posterUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=800&q=80',
    description: 'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft, along with a team of researchers, to find a new planet for humans.',
    releaseDate: new Date('2014-11-07'),
  },
  {
    title: 'The Dark Knight',
    genre: 'Action',
    language: 'English',
    duration: 152,
    rating: '9.0',
    posterUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
    description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
    releaseDate: new Date('2008-07-18'),
  },
  {
    title: 'Oppenheimer',
    genre: 'Drama',
    language: 'English',
    duration: 180,
    rating: '8.5',
    posterUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
    description: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.',
    releaseDate: new Date('2023-07-21'),
  },
  {
    title: 'Spider-Man: Across the Spider-Verse',
    genre: 'Animation',
    language: 'English',
    duration: 140,
    rating: '8.7',
    posterUrl: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&w=800&q=80',
    description: 'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence.',
    releaseDate: new Date('2023-06-02'),
  },
  {
    title: 'Dune: Part Two',
    genre: 'Sci-Fi',
    language: 'English',
    duration: 166,
    rating: '8.6',
    posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
    description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.',
    releaseDate: new Date('2024-03-01'),
  },
  {
    title: 'The Grand Budapest Hotel',
    genre: 'Comedy',
    language: 'English',
    duration: 99,
    rating: '8.1',
    posterUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
    description: 'A writer encounters the owner of an aging high-class hotel, who tells him of his early years serving as a lobby boy in the hotel\'s glorious years under an exceptional concierge.',
    releaseDate: new Date('2014-03-28'),
  },
];

const seedDatabase = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/imovies';
  console.log(`[Seed] Connecting to MongoDB: ${mongoUri}...`);
  
  try {
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected to database');

    // Clear existing data
    await Movie.deleteMany({});
    await Showtime.deleteMany({});
    await User.deleteMany({});
    await Booking.deleteMany({});
    console.log('[Seed] Cleared existing collections');

    // Create Demo Users
    const demoUser = await User.create({
      name: 'Neo Hacker',
      email: 'demo@imovies.com',
      password: 'password123',
      role: 'user',
    });

    const adminUser = await User.create({
      name: 'System Admin',
      email: 'admin@imovies.com',
      password: 'admin123',
      role: 'admin',
    });
    console.log('[Seed] Created demo users (demo@imovies.com, admin@imovies.com)');

    // Insert Movies
    const insertedMovies = await Movie.insertMany(sampleMovies);
    console.log(`[Seed] Inserted ${insertedMovies.length} movies`);

    // Generate Showtimes for each movie
    const showtimes = [];
    const times = ['11:00 AM', '02:30 PM', '06:00 PM', '09:30 PM'];
    const halls = ['Screen 1 (IMAX)', 'Screen 2 (Dolby Atmos)', 'Screen 3 (Standard)'];
    const prices = [250, 350, 450];

    const today = new Date();

    for (let i = 0; i < insertedMovies.length; i++) {
      const movie = insertedMovies[i];
      
      // 3 showtimes per movie across next 2 days
      for (let dayOffset = 0; dayOffset < 2; dayOffset++) {
        const showDate = new Date(today);
        showDate.setDate(today.getDate() + dayOffset);
        showDate.setHours(0, 0, 0, 0);

        const timeSlot = times[(i + dayOffset) % times.length];
        const hall = halls[(i + dayOffset) % halls.length];
        const price = prices[i % prices.length];

        // Seed a few booked seats for realistic realism
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
    console.log(`[Seed] Inserted ${insertedShowtimes.length} showtimes`);

    // Create a demo booking for demoUser
    if (insertedShowtimes.length > 0) {
      await Booking.create({
        userId: demoUser._id,
        showtimeId: insertedShowtimes[0]._id,
        seats: ['A1', 'A2'],
        totalAmount: insertedShowtimes[0].price * 2,
        status: 'confirmed',
      });
      console.log('[Seed] Created initial demo booking');
    }

    console.log('[Seed] Database seeding completed successfully! 🚀');
    process.exit(0);
  } catch (error) {
    console.error('[Seed] Error seeding database:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  seedDatabase();
}

module.exports = { sampleMovies, seedDatabase };
