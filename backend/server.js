const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const passport = require('passport');
const connectDB = require('./config/db');
const configurePassport = require('./config/passport');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Middlewares
app.use((req, res, next) => {
  const origin = req.headers.origin;

  res.header("Access-Control-Allow-Origin", origin || "*");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});
app.use(express.json());
app.use(passport.initialize());

// Connect Database
connectDB();

// Passport Config
configurePassport();

// Import Routes
const authRoutes = require('./routes/auth.routes');
const emailRoutes = require('./routes/email.routes');
const analyticsRoutes = require('./routes/analytics.routes');

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/emails', emailRoutes);
app.use('/api/analytics', analyticsRoutes);

// Base Route
app.get('/', (req, res) => {
  res.send('MailMate API Server is running...');
});

// Temporary CORS test route
app.get("/cors-test", (req, res) => {
  res.json({
    origin: req.headers.origin,
    success: true
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

// Port configuration
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("🔥 MAILMATE SERVER RESTARTED");
  console.log("🔥 ACTIVE CORS CONFIG LOADED");
  console.log(`\n🚀 MailMate Backend Server listening on port ${PORT}`);
  console.log(`🌐 API Base URL: http://localhost:${PORT}`);
});
