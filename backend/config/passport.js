const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

const configurePassport = () => {
  const clientID = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const callbackURL = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/auth/google/callback';

  if (!clientID || !clientSecret) {
    console.warn('⚠️  Google OAuth Client ID/Secret not configured. Google Sign-In strategy deactivated.');
    return;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID,
        clientSecret,
        callbackURL,
        scope: ['profile', 'email', 'https://www.googleapis.com/auth/gmail.readonly']
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails[0].value;
          
          // Try to find user or create
          let user = await User.findOne({ email });
          
          const updateData = {
            name: profile.displayName,
            googleId: profile.id,
            profilePicture: profile.photos[0] ? profile.photos[0].value : '',
            accessToken,
            tokenExpiry: new Date(Date.now() + 3500 * 1000) // 1 hr expiry
          };

          if (refreshToken) {
            updateData.refreshToken = refreshToken;
          }

          if (user) {
            user = await User.findOneAndUpdate({ email }, { $set: updateData });
          } else {
            user = await User.create({
              email,
              ...updateData
            });
          }
          
          return done(null, user);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );
};

module.exports = configurePassport;
