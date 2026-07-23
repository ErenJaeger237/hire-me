const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { sequelize, ensureDatabaseExists, User, ProviderProfile, Booking } = require('./models');
const authController = require('./controllers/authController');
const providerController = require('./controllers/providerController');
const bookingController = require('./controllers/bookingController');
const { authenticateToken } = require('./middleware/authMiddleware');
const userController = require('./controllers/userController');
const messageController = require('./controllers/messageController');
const savedController = require('./controllers/savedController');
const setupSwagger = require('./config/swagger');
const bcrypt = require('bcryptjs');

const app = express();
const http = require('http');
const { Server } = require('socket.io');
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*', // Allow all origins for easier deployment, restrict later
    credentials: true,
    methods: ['GET', 'POST']
  }
});

app.set('io', io); // Make io accessible in controllers

io.on('connection', (socket) => {
  console.log('A user connected to socket:', socket.id);

  socket.on('join_booking', (bookingId) => {
    socket.join(`booking_${bookingId}`);
    console.log(`User ${socket.id} joined room: booking_${bookingId}`);
  });

  socket.on('join_user', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User ${socket.id} joined room: user_${userId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});
const PORT = process.env.PORT || 5000;
const path = require('path');
const multer = require('multer');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/uploads/'))
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
});

const ALLOWED_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const imageFileFilter = (req, file, cb) => {
  if (ALLOWED_IMAGE_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, PNG, and WEBP images are allowed.'), false);
  }
};

const ALLOWED_DOC_MIME_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', ...ALLOWED_IMAGE_MIME_TYPES];
const docFileFilter = (req, file, cb) => {
  if (ALLOWED_DOC_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, DOC, DOCX, and images are allowed.'), false);
  }
};

const imageUpload = multer({ 
  storage, 
  fileFilter: imageFileFilter, 
  limits: { fileSize: 5 * 1024 * 1024 } 
});

const docUpload = multer({ 
  storage, 
  fileFilter: docFileFilter, 
  limits: { fileSize: 10 * 1024 * 1024 } 
});

// Security Middleware
app.use(helmet({ crossOriginResourcePolicy: false })); // allows serving images cross-origin
app.use(cors());
app.use(express.json());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' }
});
if (process.env.NODE_ENV === 'production') {
  app.use('/api/', apiLimiter);
}

app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

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
app.post('/api/auth/register', authController.register);

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
app.post('/api/auth/login', authController.login);

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
app.get('/api/providers', providerController.getProviders);
app.get('/api/providers/me/earnings', authenticateToken, providerController.getEarnings);
app.get('/api/providers/:id', providerController.getProviderById);

// Saved / Favourite Providers (F-11)
app.get('/api/saved', authenticateToken, savedController.getSaved);
app.post('/api/saved/:id', authenticateToken, savedController.saveProvider);
app.delete('/api/saved/:id', authenticateToken, savedController.unsaveProvider);
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
app.post('/api/bookings', authenticateToken, bookingController.createBooking);
app.get('/api/bookings', authenticateToken, bookingController.getBookings);

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
app.patch('/api/bookings/:id', authenticateToken, bookingController.updateBookingStatus);
app.post('/api/bookings/:id/review', authenticateToken, bookingController.addReview);

// User Profile routes
app.get('/api/users/profile', authenticateToken, userController.getProfile);
app.put('/api/users/profile', authenticateToken, userController.updateProfile);
app.post('/api/users/upgrade-to-provider', authenticateToken, userController.upgradeToProvider);
app.get('/api/users/notifications', authenticateToken, userController.getNotifications);

app.post('/api/users/profile/upload', authenticateToken, imageUpload.single('profile_picture'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });
    
    // Construct the URL
    const fileUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`;
    
    // Update the user
    await User.update({ profile_picture_url: fileUrl }, { where: { id: req.user.id } });
    
    return res.status(200).json({ profile_picture_url: fileUrl });
  } catch (err) {
    console.error('File upload error:', err);
    return res.status(500).json({ error: 'Failed to upload profile picture.' });
  }
});

app.post('/api/users/profile/document', authenticateToken, docUpload.single('verification_doc'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });
    const fileUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`;
    await ProviderProfile.update({ verification_doc_url: fileUrl }, { where: { user_id: req.user.id } });
    return res.status(200).json({ verification_doc_url: fileUrl });
  } catch (err) {
    console.error('File upload error:', err);
    return res.status(500).json({ error: 'Failed to upload document.' });
  }
});
app.get('/api/bookings/:bookingId/messages', authenticateToken, messageController.getMessages);
app.post('/api/bookings/:bookingId/messages', authenticateToken, messageController.sendMessage);

const adminController = require('./controllers/adminController');
app.get('/api/admin/analytics', authenticateToken, adminController.getAnalytics);
app.get('/api/admin/users', authenticateToken, adminController.getUsers);
app.get('/api/admin/providers', authenticateToken, adminController.getProviders);
app.patch('/api/admin/providers/:id/verify', authenticateToken, adminController.verifyProvider);
app.get('/api/admin/disputes', authenticateToken, adminController.getDisputes);
app.patch('/api/admin/users/:id/ban', authenticateToken, adminController.banUser);
app.patch('/api/admin/users/:id/wallet', authenticateToken, adminController.updateWallet);

const walletController = require('./controllers/walletController');
app.get('/api/wallet/balance', authenticateToken, walletController.getBalance);
app.post('/api/wallet/topup', authenticateToken, walletController.topUp);
app.get('/api/wallet/history', authenticateToken, walletController.getHistory);

// Seed database function
async function seedDefaultData() {
  try {
    const userCount = await User.count();
    if (userCount === 0) {
      console.log('Seeding default users and providers...');
      
      const password_hash = await bcrypt.hash('password123', 10);
      
      // Seed Admin
      await User.create({
        name: 'System Admin',
        email: 'admin@hireme.cm',
        password_hash,
        role: 'ADMIN',
      });

      // Seed Client
      const client = await User.create({
        name: 'Franck Ateba',
        email: 'client@example.com',
        password_hash,
        role: 'CLIENT',
        location_lat: 4.0511,
        location_lng: 9.7085, // Douala
      });

      const providersData = [
        { name: 'Dr. Amadou Diallo', email: 'amadou@example.com', trade: 'Math Tutor', hourly_rate: 5000, bio: 'PhD in Mathematics. 8+ years experience tutoring calculus and algebra.', rating: 4.9 },
        { name: 'Chantal Biya', email: 'chantal@example.com', trade: 'Electrician', hourly_rate: 10000, bio: 'Certified master electrician specializing in home rewiring and solar power.', rating: 4.8 },
        { name: 'Samuel Eto', email: 'samuel@example.com', trade: 'Plumber', hourly_rate: 7500, bio: 'Expert emergency plumbing, pipe installation, and leak detection.', rating: 4.7 },
        { name: 'Nathalie Makon', email: 'nathalie@example.com', trade: 'English Tutor', hourly_rate: 4000, bio: 'IELTS coach and academic writing specialist for all levels.', rating: 5.0 },
      ];

      for (const p of providersData) {
        const pUser = await User.create({
          name: p.name,
          email: p.email,
          password_hash,
          role: 'PROVIDER',
          location_lat: 4.05 + (Math.random() * 0.05),
          location_lng: 9.70 + (Math.random() * 0.05),
        });

        const profile = await ProviderProfile.create({
          user_id: pUser.id,
          trade: p.trade,
          hourly_rate: p.hourly_rate,
          bio: p.bio,
          rating: p.rating,
          is_verified: true,
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
      
      console.log('Database seeded successfully.');
    }
  } catch (err) {
    console.error('Failed to seed DB:', err);
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

  server.listen(PORT, () => {
    console.log(`[Server] Hire Me Express API listening on http://localhost:${PORT}`);
  });
}

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = { app, server };
