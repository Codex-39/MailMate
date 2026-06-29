const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth.middleware');

const JWT_SECRET = process.env.JWT_SECRET || 'mailmate_secret_key_123';

// Generate JWT for User
const generateToken = (user) => {
  return jwt.sign(
    { userId: user._id, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};


// @route   GET api/auth/google
// @desc    Authenticate with Google OAuth
router.get('/google', (req, res, next) => {
  const clientID = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  
  if (!clientID || !clientSecret) {
    console.error('[Auth Error] Google Client ID or Client Secret is not set in backend environment variables.');
    return res.status(400).json({
      message: 'Google Sign-In is not configured on the backend server.',
      configNeeded: true
    });
  }

  // Capture current frontend origin from request query or header to dynamic redirect
  const clientOrigin = req.query.origin || req.headers.referer || 'http://localhost:5173';
  
  console.log(`[Auth Info] Initiating Google login. Client origin: ${clientOrigin}`);

  passport.authenticate('google', {
    accessType: 'offline',
    prompt: 'consent',
    state: Buffer.from(JSON.stringify({ origin: clientOrigin })).toString('base64'),
    scope: ['profile', 'email', 'https://www.googleapis.com/auth/gmail.readonly']
  })(req, res, next);
});

// @route   GET api/auth/google/callback
// @desc    Google OAuth Callback
router.get(
  '/google/callback',
  (req, res, next) => {
    // Parse origin state parameter
    let originState = {};
    try {
      if (req.query.state) {
        originState = JSON.parse(Buffer.from(req.query.state, 'base64').toString());
      }
    } catch (err) {
      console.error('[Auth Error] Failed to parse state payload:', err.message);
    }
    
    const frontendUrl = originState.origin || process.env.FRONTEND_URL || 'http://localhost:5173';
    
    // Dynamic callback auth router
    passport.authenticate('google', { session: false }, async (err, user, info) => {
      if (err || !user) {
        console.error('[Auth Error] Google authentication failed callback:', err || info);
        return res.redirect(`${frontendUrl}/login?error=auth_failed`);
      }
      
      try {
        const token = generateToken(user);
        
        console.log(`[Auth Info] Google login successful. Redirecting user back to: ${frontendUrl}`);
        return res.redirect(`${frontendUrl}/login-success?token=${token}`);
      } catch (procErr) {
        console.error('[Auth Error] Failed during session callback initialization:', procErr);
        return res.redirect(`${frontendUrl}/login?error=auth_failed`);
      }
    })(req, res, next);
  }
);

// @route   GET api/auth/me
// @desc    Get currently logged-in user profile details (protected)
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      profilePicture: user.profilePicture
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error retrieving profile' });
  }
});

module.exports = router;
