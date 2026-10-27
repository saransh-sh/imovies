/**
 * IMovies Capstone Automated Test Suite
 * End-to-end integration and unit testing with real MongoDB (MongoMemoryServer)
 * and real Express HTTP requests (Supertest).
 */

const assert = require('assert');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const app = require('../server');
const User = require('../models/User');
const Movie = require('../models/Movie');
const Showtime = require('../models/Showtime');
const Booking = require('../models/Booking');
const { sampleMovies } = require('../seed/seed');

let mongod;
let demoToken = '';
let demoUserId = '';
let testMovieId = '';
let testShowtimeId = '';

// Suite 1: Password Hashing & bcrypt Verification
async function testPasswordHashing() {
  console.log('\n--- 1. Testing Password Hashing & bcrypt Verification ---');
  const plainPassword = 'SuperSecretPassword2026!';
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(plainPassword, salt);

  assert(hash !== plainPassword, 'Hash must not equal plain password');
  assert(hash.startsWith('$2'), 'Hash must be a valid bcrypt string');

  const match = await bcrypt.compare(plainPassword, hash);
  assert.strictEqual(match, true, 'bcrypt.compare must return true for correct password');

  const wrongMatch = await bcrypt.compare('WrongPassword', hash);
  assert.strictEqual(wrongMatch, false, 'bcrypt.compare must return false for incorrect password');
  console.log('✓ Password hashing and verification passed');
}

// Suite 2: JWT Signing, Verification & Expiry
function testJwtAuthentication() {
  console.log('\n--- 2. Testing JWT Signing, Verification & Expiry ---');
  const secret = 'imovies_super_secret_jwt_key_2026';
  const payload = {
    id: '671e3b62f18374a240899101',
    name: 'Neo Hacker',
    email: 'demo@imovies.com',
    role: 'user',
  };

  const token = jwt.sign(payload, secret, { expiresIn: '7d' });
  assert(typeof token === 'string' && token.length > 20, 'JWT must be a valid token string');

  const decoded = jwt.verify(token, secret);
  assert.strictEqual(decoded.id, payload.id, 'Decoded user ID must match payload');
  assert.strictEqual(decoded.email, payload.email, 'Decoded email must match payload');
  assert.strictEqual(decoded.role, payload.role, 'Decoded role must match payload');

  // Verify tampered token fails
  assert.throws(() => {
    jwt.verify(token + 'tampered', secret);
  }, 'Tampered token must throw verification error');

  // Verify wrong secret fails
  assert.throws(() => {
    jwt.verify(token, 'wrong_secret_key');
  }, 'Wrong secret must throw verification error');
  console.log('✓ JWT authentication and security assertions passed');
}

// Suite 3: Auth Middleware Unit Behavior
function testAuthMiddleware() {
  console.log('\n--- 3. Testing Auth Middleware Behavior ---');
  const authMiddleware = require('../middleware/auth');
  const secret = 'imovies_super_secret_jwt_key_2026';
  process.env.JWT_SECRET = secret;

  // Test 3.1: Missing Authorization Header
  {
    const req = { headers: {} };
    let statusCode = null;
    let responseData = null;
    const res = {
      status: (code) => {
        statusCode = code;
        return {
          json: (data) => {
            responseData = data;
          },
        };
      },
    };
    let nextCalled = false;
    authMiddleware(req, res, () => {
      nextCalled = true;
    });

    assert.strictEqual(statusCode, 401, 'Must return 401 when header is missing');
    assert.strictEqual(responseData.success, false, 'Response success must be false');
    assert.strictEqual(nextCalled, false, 'next() must NOT be called');
  }

  // Test 3.2: Malformed Header (no Bearer)
  {
    const req = { headers: { authorization: 'Basic 12345' } };
    let statusCode = null;
    const res = {
      status: (code) => {
        statusCode = code;
        return { json: () => {} };
      },
    };
    authMiddleware(req, res, () => {});
    assert.strictEqual(statusCode, 401, 'Must return 401 for non-Bearer auth');
  }

  // Test 3.3: Valid Bearer Token
  {
    const token = jwt.sign({ id: 'user123', role: 'user' }, secret);
    const req = { headers: { authorization: `Bearer ${token}` } };
    let nextCalled = false;
    const res = {
      status: () => ({ json: () => {} }),
    };
    authMiddleware(req, res, () => {
      nextCalled = true;
    });
    assert.strictEqual(nextCalled, true, 'next() must be called on valid token');
    assert.strictEqual(req.user.id, 'user123', 'req.user must be populated');
  }

  console.log('✓ Auth middleware unit cases passed');
}

// Suite 4: End-to-End Auth HTTP API Tests
async function testAuthEndpoints() {
  console.log('\n--- 4. Testing Auth Endpoints (Register, Login, Me) via HTTP ---');

  // 4.1 Register a new user
  const regRes = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Agent Smith',
      email: 'smith@matrix.com',
      password: 'matrixPassword123',
    });
  assert.strictEqual(regRes.status, 201, 'Register must return 201 Created');
  assert.strictEqual(regRes.body.success, true);
  assert(regRes.body.token, 'Must return JWT token');
  assert.strictEqual(regRes.body.user.email, 'smith@matrix.com');

  demoToken = regRes.body.token;
  demoUserId = regRes.body.user.id;

  // 4.2 Duplicate email registration rejection
  const dupRes = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Agent Smith Clone',
      email: 'smith@matrix.com',
      password: 'anotherPassword123',
    });
  assert.strictEqual(dupRes.status, 409, 'Duplicate email must return 409 Conflict');

  // 4.3 Short password rejection (<6 chars)
  const shortPassRes = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Bad Pass',
      email: 'badpass@test.com',
      password: '123',
    });
  assert.strictEqual(shortPassRes.status, 400, 'Short password must return 400 Bad Request');

  // 4.4 Invalid email format rejection
  const badEmailRes = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Bad Email',
      email: 'not-an-email',
      password: 'validPassword123',
    });
  assert.strictEqual(badEmailRes.status, 400, 'Invalid email format must return 400 Bad Request');

  // 4.5 Login with correct credentials
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'smith@matrix.com',
      password: 'matrixPassword123',
    });
  assert.strictEqual(loginRes.status, 200, 'Login must return 200 OK');
  assert.strictEqual(loginRes.body.success, true);
  assert(loginRes.body.token);

  // 4.6 Login with wrong password
  const badLoginRes = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'smith@matrix.com',
      password: 'WrongPassword!',
    });
  assert.strictEqual(badLoginRes.status, 401, 'Wrong password must return 401 Unauthorized');

  // 4.7 GET /api/auth/me with Bearer token
  const meRes = await request(app)
    .get('/api/auth/me')
    .set('Authorization', `Bearer ${demoToken}`);
  assert.strictEqual(meRes.status, 200, 'GET /me must return 200 OK');
  assert.strictEqual(meRes.body.user.email, 'smith@matrix.com');
  assert.strictEqual(meRes.body.user.password, undefined, 'Password must not be returned');

  // 4.8 GET /api/auth/me without token
  const meUnauthRes = await request(app).get('/api/auth/me');
  assert.strictEqual(meUnauthRes.status, 401, 'GET /me without token must return 401 Unauthorized');

  console.log('✓ Auth endpoints passed all validation, duplicate, and security checks');
}

// Suite 5: Movies & Showtimes HTTP API Tests
async function testMoviesAndShowtimes() {
  console.log('\n--- 5. Testing Movies & Showtimes Endpoints & Attack Resiliency ---');

  // Seed sample movies
  const insertedMovies = await Movie.insertMany(sampleMovies);
  assert(insertedMovies.length >= 6, 'Must seed at least 6 movies');
  testMovieId = insertedMovies[0]._id.toString();

  // Create a showtime for the first movie
  const showtimeDoc = await Showtime.create({
    movieId: insertedMovies[0]._id,
    date: new Date(),
    time: '07:30 PM',
    hall: 'Screen 1 (IMAX)',
    totalSeats: 40,
    price: 350,
    bookedSeats: ['A1', 'A2'],
  });
  testShowtimeId = showtimeDoc._id.toString();

  // 5.1 GET /api/movies
  const moviesRes = await request(app).get('/api/movies');
  assert.strictEqual(moviesRes.status, 200);
  assert.strictEqual(moviesRes.body.success, true);
  assert.strictEqual(moviesRes.body.movies.length, insertedMovies.length);

  // 5.2 Genre filtering
  const genreRes = await request(app).get('/api/movies?genre=Sci-Fi');
  assert.strictEqual(genreRes.status, 200);
  assert(genreRes.body.movies.every((m) => m.genre.toLowerCase() === 'sci-fi'));

  // 5.3 Search by title
  const searchRes = await request(app).get('/api/movies?search=Inter');
  assert.strictEqual(searchRes.status, 200);
  assert(searchRes.body.movies.some((m) => m.title === 'Interstellar'));

  // 5.4 Regex Special Characters Injection in Search (Must NOT crash with 500)
  const regexAttackRes = await request(app).get('/api/movies?search=Dune+[');
  assert.strictEqual(
    regexAttackRes.status,
    200,
    'Search with unescaped regex characters must not crash server with 500'
  );

  // 5.5 GET /api/movies/:id valid
  const singleMovieRes = await request(app).get(`/api/movies/${testMovieId}`);
  assert.strictEqual(singleMovieRes.status, 200);
  assert.strictEqual(singleMovieRes.body.movie.title, insertedMovies[0].title);
  assert.strictEqual(singleMovieRes.body.showtimes.length, 1);

  // 5.6 GET /api/movies/:id with malformed ObjectId (Must return 404, not 500 CastError)
  const badMovieIdRes = await request(app).get('/api/movies/not-a-valid-id');
  assert.strictEqual(badMovieIdRes.status, 404, 'Malformed movie ID must return 404 Not Found');

  // 5.7 GET /api/showtimes/:id valid
  const stRes = await request(app).get(`/api/showtimes/${testShowtimeId}`);
  assert.strictEqual(stRes.status, 200);
  assert.strictEqual(stRes.body.showtime.time, '07:30 PM');
  assert.deepStrictEqual(stRes.body.showtime.bookedSeats, ['A1', 'A2']);

  // 5.8 GET /api/showtimes/:id with malformed ObjectId
  const badStIdRes = await request(app).get('/api/showtimes/not-a-valid-id');
  assert.strictEqual(badStIdRes.status, 404, 'Malformed showtime ID must return 404 Not Found');

  console.log('✓ Movies and Showtimes endpoints passed search escaping, filtering, and ObjectId validation');
}

// Suite 6: Real Atomic Concurrency, Anti-Double Booking & Cancellation Tests
async function testRealBookingConcurrencyAndCancellation() {
  console.log('\n--- 6. Testing Real MongoDB Atomic Concurrency & Booking Lifecycle ---');

  // 6.1 Unauthorized booking attempt
  const unauthRes = await request(app)
    .post('/api/bookings')
    .send({ showtimeId: testShowtimeId, seats: ['C1'] });
  assert.strictEqual(unauthRes.status, 401, 'Booking without auth must return 401 Unauthorized');

  // 6.2 Booking with already booked seat ('A1' is pre-seeded as booked)
  const conflictRes = await request(app)
    .post('/api/bookings')
    .set('Authorization', `Bearer ${demoToken}`)
    .send({ showtimeId: testShowtimeId, seats: ['A1', 'C1'] });
  assert.strictEqual(conflictRes.status, 409, 'Booking an already reserved seat must return 409 Conflict');

  // Verify 'C1' was NOT booked because the transaction failed atomically
  const stCheck = await Showtime.findById(testShowtimeId);
  assert.strictEqual(stCheck.bookedSeats.includes('C1'), false, 'C1 must not be booked after conflict');

  // 6.3 Booking with duplicate seats in same request (e.g. ['C1', 'C1'])
  const dupSeatRes = await request(app)
    .post('/api/bookings')
    .set('Authorization', `Bearer ${demoToken}`)
    .send({ showtimeId: testShowtimeId, seats: ['C1', 'C1'] });
  assert.strictEqual(dupSeatRes.status, 400, 'Duplicate seat request must return 400 Bad Request');

  // 6.4 Booking with invalid seat format (e.g. ['INVALID_SEAT'])
  const invalidSeatRes = await request(app)
    .post('/api/bookings')
    .set('Authorization', `Bearer ${demoToken}`)
    .send({ showtimeId: testShowtimeId, seats: ['INVALID_SEAT'] });
  assert.strictEqual(invalidSeatRes.status, 400, 'Invalid seat code must return 400 Bad Request');

  // 6.5 Valid booking of available seats (C1, C2)
  const validBookingRes = await request(app)
    .post('/api/bookings')
    .set('Authorization', `Bearer ${demoToken}`)
    .send({ showtimeId: testShowtimeId, seats: ['c1', 'c2'] }); // Test case-insensitivity
  assert.strictEqual(validBookingRes.status, 201, 'Valid booking must return 201 Created');
  assert.strictEqual(validBookingRes.body.success, true);
  assert.strictEqual(validBookingRes.body.booking.seats.length, 2);
  assert.strictEqual(validBookingRes.body.booking.totalAmount, 700); // 2 * 350
  const createdBookingId = validBookingRes.body.booking._id;

  // Confirm in MongoDB
  const stAfterBooking = await Showtime.findById(testShowtimeId);
  assert(stAfterBooking.bookedSeats.includes('C1') && stAfterBooking.bookedSeats.includes('C2'));

  // 6.6 Concurrent Race Condition Test: Two simultaneous requests attempting to book 'D1'
  console.log('   Simulating simultaneous concurrent race condition for seat D1...');
  const [raceRes1, raceRes2] = await Promise.all([
    request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${demoToken}`)
      .send({ showtimeId: testShowtimeId, seats: ['D1'] }),
    request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${demoToken}`)
      .send({ showtimeId: testShowtimeId, seats: ['D1'] }),
  ]);

  const statuses = [raceRes1.status, raceRes2.status];
  assert(
    statuses.includes(201) && statuses.includes(409),
    `Expected exactly one 201 Created and one 409 Conflict in concurrent race condition, got: ${statuses.join(', ')}`
  );
  console.log('   ✓ Real concurrency test: exactly 1 booking succeeded (201), 1 collision rejected (409)');

  // 6.7 User Bookings List
  const userBookingsRes = await request(app)
    .get('/api/bookings/me')
    .set('Authorization', `Bearer ${demoToken}`);
  assert.strictEqual(userBookingsRes.status, 200);
  assert(userBookingsRes.body.bookings.length >= 2, 'User must have at least 2 bookings');

  // 6.8 Soft Cancel Booking & Seat Release
  const cancelRes = await request(app)
    .patch(`/api/bookings/${createdBookingId}/cancel`)
    .set('Authorization', `Bearer ${demoToken}`);
  assert.strictEqual(cancelRes.status, 200, 'Cancel must return 200 OK');
  assert.strictEqual(cancelRes.body.booking.status, 'cancelled');

  // Verify seats C1, C2 are released in MongoDB
  const stAfterCancel = await Showtime.findById(testShowtimeId);
  assert.strictEqual(stAfterCancel.bookedSeats.includes('C1'), false, 'C1 must be released');
  assert.strictEqual(stAfterCancel.bookedSeats.includes('C2'), false, 'C2 must be released');

  // 6.9 Double-cancellation rejection
  const doubleCancelRes = await request(app)
    .patch(`/api/bookings/${createdBookingId}/cancel`)
    .set('Authorization', `Bearer ${demoToken}`);
  assert.strictEqual(doubleCancelRes.status, 400, 'Double cancellation must return 400 Bad Request');

  // 6.10 Re-booking released seat C1 now succeeds
  const rebookRes = await request(app)
    .post('/api/bookings')
    .set('Authorization', `Bearer ${demoToken}`)
    .send({ showtimeId: testShowtimeId, seats: ['C1'] });
  assert.strictEqual(rebookRes.status, 201, 'Re-booking released seat C1 must succeed');

  console.log('✓ Real atomic concurrency, seat collision prevention, and soft cancellation lifecycle passed');
}

// Suite 7: Health Check & Global Server Routes
async function testHealthAndErrorRoutes() {
  console.log('\n--- 7. Testing Health & Global Fallback Routes ---');

  const rootRes = await request(app).get('/');
  assert.strictEqual(rootRes.status, 200);
  assert.strictEqual(rootRes.body.status, 'ONLINE');

  const healthRes = await request(app).get('/api/health');
  assert.strictEqual(healthRes.status, 200);
  assert.strictEqual(healthRes.body.status, 'HEALTHY');

  const notFoundRes = await request(app).get('/api/non-existent-endpoint');
  assert.strictEqual(notFoundRes.status, 404);
  assert.strictEqual(notFoundRes.body.success, false);

  console.log('✓ Health and fallback routes verified');
}

// Master Test Runner
async function runAllTests() {
  console.log('========================================================');
  console.log('🚀 RUNNING IMOVIES REAL INTEGRATION & UNIT TEST SUITE');
  console.log('========================================================');

  try {
    // Spin up real in-memory MongoDB
    mongod = await MongoMemoryServer.create();
    process.env.MONGO_URI = mongod.getUri();
    process.env.NODE_ENV = 'test';
    process.env.JWT_SECRET = 'imovies_super_secret_jwt_key_2026';

    await mongoose.connect(process.env.MONGO_URI);

    await testPasswordHashing();
    testJwtAuthentication();
    testAuthMiddleware();
    await testAuthEndpoints();
    await testMoviesAndShowtimes();
    await testRealBookingConcurrencyAndCancellation();
    await testHealthAndErrorRoutes();

    console.log('\n========================================================');
    console.log('✅ ALL INTEGRATION & UNIT SUITES PASSED (100% REAL DB)');
    console.log('========================================================\n');

    await mongoose.disconnect();
    await mongod.stop();
    process.exit(0);
  } catch (err) {
    console.error('\n❌ TEST SUITE FAILED:', err.message);
    console.error(err.stack);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    if (mongod) {
      await mongod.stop();
    }
    process.exit(1);
  }
}

runAllTests();
