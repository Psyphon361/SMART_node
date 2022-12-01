import passport from 'passport';
import passport_twitter from 'passport-twitter';
import User from '../models/user.js';
import dotenv from 'dotenv';
dotenv.config();
const TwitterStrategy = passport_twitter.Strategy;
const log = console.log;

passport.use(
  new TwitterStrategy(
    {
      consumerKey: process.env.TWITTER_CONSUMER_KEY,
      consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
      callbackURL: 'http://localhost:3000/twitter/callback',
      scope: ['user:email'],
    },
    function (token, tokenSecret, profile, cb) {
      User.findOrCreate(
        { email: profile.username + "@gmail.com" },
        function (err, user) {
          return cb(err, user);
        }
      );
    }
  )
);
