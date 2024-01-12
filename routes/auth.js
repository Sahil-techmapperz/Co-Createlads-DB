const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

const router = express.Router();

// Passport configuration for Google OAuth
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
      try {
          const existingUser = await User.findOne({ googleId: profile.id });

          if (existingUser) {
              return done(null, existingUser);
          }

          const newUser = new User({ 
              googleId: profile.id, 
              email: profile.emails[0].value,
              name: profile.displayName 
          });

          await newUser.save();
          done(null, newUser);
      } catch (error) {
          done(error, null);
      }
  }
));

// Serialize user
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserialize user
passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => done(err, user));
});

// Google authentication route
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Google OAuth callback route
router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
      // Successful authentication, redirect home.
      res.redirect('/');
  }
);

module.exports = router;
