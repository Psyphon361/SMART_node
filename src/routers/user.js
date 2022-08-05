// import path from 'path';
import express from 'express';
import User from '../models/user.js';
import auth from '../middleware/auth.js';
// const passport = require("passport");
import jwt from 'jsonwebtoken';
import '../db/mongoose.js';
import shared_data from '../shared-data/shared-vars.js';

const router = new express.Router();

router.get('/', async (req, res) => {
  const token = req.cookies.jwt;

  if (token == null) {
    shared_data.user_is_authenticated = false;
  } else {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findOne({
      _id: decoded._id,
      'tokens.token': token,
    });

    if (!user) {
      shared_data.user_is_authenticated = false;
    } else {
      shared_data.user_is_authenticated = true;
    }
  }

  res.render('home', {
    title: 'SMART | Home',
    shared_data,
  });
});

router.post('/', (req, res) => {
  console.log(JSON.stringify(req.body));
});

router.get('/signup', (req, res) => {
  res.render('signup', {
    title: 'SMART | Sign Up',
    shared_data,
  });
});

router.post('/signup', async (req, res) => {
  // shared_data.email_flag = false;

  // console.log(req.body);

  // const re =
  //   /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;

  // if (!re.test(req.body.password)) {
  //   shared_data.strong_password = false;
  //   res.redirect('/signup');
  // } else {
  // shared_data.strong_password = true;

  const user = new User(req.body);

  try {
    await user.save();

    const token = await user.generateAuthToken();

    res.cookie('jwt', token, {
      httpOnly: true,
      secure: false,
    });

    shared_data.user_is_authenticated = true;

    res.status(201).send(user); // REDIRECT TO REGISTRATION FORM AFTER SIGNUP
  } catch (e) {
    res.status(400);
  }

  // console.log(user);

  // const existing_user = await User.findOne({ email: user.email });
  // console.log(existing_user);

  // if (existing_user) {
  //   shared_data.email_flag = true;
  //   res.redirect('/signup');
  // } else {
  //   try {
  //     await user.save();
  //     // sendWelcomeEmail(user.email, user.name);
  //     const token = await user.generateAuthToken();

  //     res.cookie('jwt', token, {
  //       httpOnly: true,
  //       secure: false,
  //     });

  //     shared_data.user_is_authenticated = true;

  //     res.status(201).redirect('/register'); // REDIRECT TO REGISTRATION FORM AFTER SIGNUP
  //   } catch (e) {
  //     res.status(400);
  //   }
  // }
  // }
});

export default router;
