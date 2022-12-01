import passport from 'passport';
import passport_google from 'passport-google-oauth20';
import User from '../models/user.js';
import dotenv from 'dotenv';
dotenv.config();
const GoogleStrategy = passport_google.Strategy;

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:3000/google/callback',
    },
    async function (accessToken, refreshToken, profile, cb) {
      User.findOrCreate({ email: profile._json.email }, function (err, user) {
        return cb(err, user);
      });
    }
  )
);
