const mongoose = require('mongoose');

let cachedPromise = null;

const connectDB = async () => {
  // If already connected, reuse connection immediately (essential for Vercel Serverless)
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // If currently connecting, await existing promise
  if (cachedPromise) {
    return cachedPromise;
  }

  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/imovies';

  cachedPromise = mongoose
    .connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    })
    .then((conn) => {
      console.log(`[MongoDB] Connected: ${conn.connection.host}/${conn.connection.name}`);
      return conn.connection;
    })
    .catch((error) => {
      cachedPromise = null;
      console.error(`[MongoDB] Connection Error: ${error.message}`);
      if (process.env.NODE_ENV === 'production' && require.main === module) {
        process.exit(1);
      }
      throw error;
    });

  return cachedPromise;
};

module.exports = connectDB;
