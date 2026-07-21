const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { sequelize, ensureDatabaseExists, User, ProviderProfile, Booking } = require('./models');
const { register, login } = require('./controllers/authController');
const { getProviders } = require('./controllers/providerController');
const { createBooking, getBookings, updateBookingStatus, addReview } = require('./controllers/bookingController');
const { authenticateToken } = require('./middleware/authMiddleware');
const setupSwagger = require('./config/swagger');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Setup Swagger UI
setupSwagger(app);

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Register a new user (Client or Provider)
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, role]
 *             properties:
 *               name: { type: string, example: "John Doe" }
 *               email: { type: string, example: "john@example.com" }
 *               password: { type: string, example: "secret123" }
 *               role: { type: string, enum: [CLIENT, PROVIDER], example: "CLIENT" }
 *               trade: { type: string, example: "Math Tutor" }
 *               hourlyRate: { type: number, example: 35.0 }
 *               bio: { type: string, example: "Experienced Math & Calculus Tutor." }
 *     responses:
 *       201:
 *         description: Created
 */
app.post('/api/auth/register', register);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: User Login
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, example: "john@example.com" }
 *               password: { type: string, example: "secret123" }
 *     responses:
 *       200:
 *         description: OK
 */
app.post('/api/auth/login', login);

/**
 * @openapi
 * /api/providers:
 *   get:
 *     summary: Fetch filtered list of service providers
 *     tags: [Providers]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *         description: Filter by trade category (e.g. Tutor, Electrician)
 *       - in: query
 *         name: maxPrice
 *         schema: { type: number }
 *         description: Maximum hourly rate filter
 *     responses:
 *       200:
 *         description: Array of provider profiles
 */
app.get('/api/providers', getProviders);

/**
 * @openapi
 * /api/bookings:
 *   post:
 *     summary: Create a new booking request
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [providerId, date]
 *             properties:
 *               providerId: { type: integer, example: 1 }
 *               date: { type: string, example: "2026-08-01T10:00:00Z" }
 *               description: { type: string, example: "Need calculus tutoring for 2 hours." }
 *     responses:
 *       201:
 *         description: Booking created
 *   get:
 *     summary: Get user bookings
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user bookings
 */
app.post('/api/bookings', authenticateToken, createBooking);
app.get('/api/bookings', authenticateToken, getBookings);

/**
 * @openapi
 * /api/bookings/{id}:
 *   patch:
 *     summary: Update booking status (ACCEPT, REJECT, COMPLETE)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [ACCEPTED, REJECTED, COMPLETED], example: "ACCEPTED" }
 *     responses:
 *       200:
 *         description: Status updated
 */
app.patch('/api/bookings/:id', authenticateToken, updateBookingStatus);
app.post('/api/bookings/:id/review', authenticateToken, addReview);

// Seed database function
async function seedDefaultData() {
  const userCount = await User.count();
  if (userCount === 0) {
    console.log('[Seed] Database is empty. Creating initial seed users...');
    const salt = await bcrypt.genSalt(10);
    const passHash = await bcrypt.hash('password123', salt);

    const client = await User.create({
      name: 'Alice Johnson',
      email: 'client@example.com',
      password_hash: passHash,
      role: 'CLIENT',
    });

    const providersData = [
      { name: 'Dr. Marcus Vance', email: 'marcus@example.com', trade: 'Math Tutor', hourly_rate: 45.0, bio: 'PhD in Mathematics. 8+ years experience tutoring calculus and algebra.', rating: 4.9 },
      { name: 'Elena Rostova', email: 'elena@example.com', trade: 'Electrician', hourly_rate: 60.0, bio: 'Certified master electrician specializing in home rewiring and solar power.', rating: 4.8 },
      { name: 'David Miller', email: 'david@example.com', trade: 'Plumber', hourly_rate: 50.0, bio: 'Expert emergency plumbing, pipe installation, and leak detection.', rating: 4.7 },
      { name: 'Sarah Jenkins', email: 'sarah@example.com', trade: 'English Tutor', hourly_rate: 35.0, bio: 'IELTS coach and academic writing specialist for all levels.', rating: 5.0 },
    ];

    for (const p of providersData) {
      const pUser = await User.create({
        name: p.name,
        email: p.email,
        password_hash: passHash,
        role: 'PROVIDER',
      });
      const profile = await ProviderProfile.create({
        user_id: pUser.id,
        trade: p.trade,
        hourly_rate: p.hourly_rate,
        bio: p.bio,
        rating: p.rating,
      });

      // Sample booking
      await Booking.create({
        client_id: client.id,
        provider_id: profile.id,
        job_date: new Date(Date.now() + 86400000 * 2),
        description: `Initial consultation for ${p.trade} services.`,
        status: 'PENDING',
      });
    }
    console.log('[Seed] Seed data successfully populated!');
  }
}

async function startServer() {
  await ensureDatabaseExists();
  try {
    await sequelize.sync({ alter: true });
    console.log('[Database] MySQL database connection established & synced.');
    await seedDefaultData();
  } catch (err) {
    console.error('[Database Error] Connection failed:', err.message);
  }

  app.listen(PORT, () => {
    console.log(`[Server] Hire Me Express API listening on http://localhost:${PORT}`);
  });
}

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = app;
