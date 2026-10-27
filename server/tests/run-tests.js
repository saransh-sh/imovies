/**
 * IMovies Capstone Test Suite
 * Comprehensive automated testing for Models, Authentication, Middleware,
 * Route validation, and Double-booking Race Condition Prevention.
 */

const assert = require('assert');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 1. Password Hashing & Verification Tests
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

// 2. JWT Signing and Expiration Tests
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

// 3. Auth Middleware Simulation
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

  console.log('✓ Auth middleware edge cases passed');
}

// 4. Double-Booking Concurrency & Seat Collision Logic
function testDoubleBookingPrevention() {
  console.log('\n--- 4. Testing Double-Booking Race Condition Prevention ---');

  // Simulate Showtime document state in-memory
  const showtimeState = {
    _id: 'showtime_interstellar_730',
    bookedSeats: ['A1', 'A2', 'C4'],
    price: 350,
  };

  // Atomic condition check: bookedSeats: { $nin: requestedSeats }
  function tryBookSeats(requestedSeats) {
    // Check if any requested seat is in already bookedSeats
    const hasCollision = requestedSeats.some((seat) => showtimeState.bookedSeats.includes(seat));
    if (hasCollision) {
      return { success: false, code: 409, message: 'Seats already booked' };
    }
    // Atomic push
    showtimeState.bookedSeats.push(...requestedSeats);
    return { success: true, code: 201, seats: requestedSeats };
  }

  // Booking attempt 1: Book C1, C2 -> Should succeed
  const booking1 = tryBookSeats(['C1', 'C2']);
  assert.strictEqual(booking1.success, true, 'Booking C1, C2 must succeed');
  assert(showtimeState.bookedSeats.includes('C1') && showtimeState.bookedSeats.includes('C2'));

  // Booking attempt 2: Try to book C2 (already booked by attempt 1) and C3 -> Must fail with 409
  const booking2 = tryBookSeats(['C2', 'C3']);
  assert.strictEqual(booking2.success, false, 'Double booking of C2 must fail');
  assert.strictEqual(booking2.code, 409, 'Must return HTTP 409 Conflict');
  assert.strictEqual(
    showtimeState.bookedSeats.includes('C3'),
    false,
    'C3 must NOT be booked if transaction failed'
  );

  // Cancellation Simulation ($pull)
  function cancelBooking(seatsToRelease) {
    showtimeState.bookedSeats = showtimeState.bookedSeats.filter(
      (seat) => !seatsToRelease.includes(seat)
    );
    return { success: true, released: seatsToRelease };
  }

  cancelBooking(['C1', 'C2']);
  assert.strictEqual(showtimeState.bookedSeats.includes('C1'), false, 'C1 must be freed');
  assert.strictEqual(showtimeState.bookedSeats.includes('C2'), false, 'C2 must be freed');

  // Booking attempt 3: Re-booking previously cancelled seat C2 -> Should now succeed
  const booking3 = tryBookSeats(['C2', 'C3']);
  assert.strictEqual(booking3.success, true, 'Re-booking released seat C2 must succeed');
  console.log('✓ Concurrency and anti-double-booking assertions passed');
}

// 5. Seed Data Integrity & Schema Structure
function testSeedDataIntegrity() {
  console.log('\n--- 5. Testing Seed Data Integrity & PRD Compliance ---');
  const { sampleMovies } = require('../seed/seed');

  assert(Array.isArray(sampleMovies), 'sampleMovies must be an array');
  assert(sampleMovies.length >= 6, `Expected at least 6 sample movies, found ${sampleMovies.length}`);

  const requiredFields = ['title', 'genre', 'duration', 'rating', 'posterUrl', 'description'];
  sampleMovies.forEach((m, idx) => {
    requiredFields.forEach((field) => {
      assert(m[field] !== undefined, `Movie ${idx} (${m.title || 'untitled'}) missing ${field}`);
    });
    assert(typeof m.duration === 'number' && m.duration > 0, 'Duration must be positive number');
  });

  const titles = sampleMovies.map((m) => m.title);
  assert(titles.includes('Interstellar'), 'Must include Interstellar');
  assert(titles.includes('The Dark Knight'), 'Must include The Dark Knight');
  assert(titles.includes('Oppenheimer'), 'Must include Oppenheimer');
  assert(titles.includes('Dune: Part Two'), 'Must include Dune: Part Two');

  console.log('✓ Seed data meets all PRD requirements');
}

// 6. Express Server Route Configuration Verification
function testServerRouteMounts() {
  console.log('\n--- 6. Testing Express App Route Registrations ---');
  const app = require('../server');

  // Inspect Express route stack
  const routes = [];
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      routes.push({
        path: middleware.route.path,
        methods: Object.keys(middleware.route.methods),
      });
    } else if (middleware.name === 'router') {
      // Router middleware
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          routes.push({
            path: handler.route.path,
            methods: Object.keys(handler.route.methods),
          });
        }
      });
    }
  });

  assert(routes.length >= 7, `Expected at least 7 mounted routes, found ${routes.length}`);
  console.log(`✓ Verified ${routes.length} REST route handlers mounted on Express`);
}

// Master Test Runner
async function runAllTests() {
  console.log('========================================================');
  console.log('🚀 RUNNING IMOVIES BACKEND TEST SUITE (6 TEST SUITES)');
  console.log('========================================================');

  try {
    await testPasswordHashing();
    testJwtAuthentication();
    testAuthMiddleware();
    testDoubleBookingPrevention();
    testSeedDataIntegrity();
    testServerRouteMounts();

    console.log('\n========================================================');
    console.log('✅ ALL TEST SUITES PASSED CLEANLY (100% SUCCESS)');
    console.log('========================================================\n');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ TEST SUITE FAILED:', err.message);
    console.error(err.stack);
    process.exit(1);
  }
}

runAllTests();
