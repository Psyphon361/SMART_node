import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import User from '../models/user.js';
import auth from '../middleware/auth.js';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';
import https from 'https';
import '../db/mongoose.js';
import shared_data from '../shared-data/shared-vars.js';
import '../oauth/google.js';
import '../oauth/twitter.js';

const router = new express.Router();
let news_feed;
let news_topic;

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

router.get('/dashboard', (req, res) => {
  res.render('dashboard', {
    title: 'SMART | Dashboard',
    shared_data,
  });
});

router.get('/signup', (req, res) => {
  res.render('signup', {
    title: 'SMART | Sign Up',
    shared_data,
  });
});

router.post('/signup', async (req, res) => {
  shared_data.email_flag = false;

  // const re =
  //   /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;

  // if (!re.test(req.body.password)) {
  //   shared_data.strong_password = false;
  //   res.redirect('/signup');
  // } else {
  shared_data.strong_password = true;
  const user = new User(req.body);

  console.log(user);

  const existing_user = await User.findOne({ email: user.email });

  console.log(existing_user);

  if (existing_user) {
    shared_data.email_flag = true;
    res.redirect('/signup');
  } else {
    try {
      await user.save();
      const token = await user.generateAuthToken();

      res.cookie('jwt', token, {
        httpOnly: true,
        secure: false,
      });

      shared_data.user_is_authenticated = true;

      res.status(201).redirect('/'); // REDIRECT TO REGISTRATION FORM AFTER SIGNUP
    } catch (e) {
      res.status(400);
    }
  }
  // }
});

router.get('/signin', (req, res) => {
  if (shared_data.user_is_authenticated) {
    res.redirect('/');
  } else {
    res.render('signin', {
      title: 'SMART | Log In',
      shared_data,
    });
  }
});

router.post('/signin', async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );

    if (shared_data.valid_user == false) {
      res.redirect('/signin');
    } else {
      const token = await user.generateAuthToken();

      res.cookie('jwt', token, {
        httpOnly: true,
        secure: false, // !!!!!------ MAKE IT SECURE BEFORE HOSTING --------!!!!!!
      });

      shared_data.user_is_authenticated = true;

      res.redirect('/');
    }
  } catch (e) {
    res.status(400).send();
  }
});

router.get('/sentiment', (req, res) => {
  res.render('sentiment', {
    shared_data,
    title: 'SMART | Sentiment Analysis',
  });
});

router.post('/sentiment', async (req, res) => {
  const agent = new https.Agent({
    rejectUnauthorized: false,
  });

  let trimmed_string;

  const text = req.body.url;
  if (text.length > 400) {
    trimmed_string = text.substring(0, 400) + '...';
  } else {
    trimmed_string = text;
  }

  // console.log(trimmed_string);

  // console.log(text);
  const encoded_text = encodeURIComponent(text.trim());
  // console.log(encoded_text);

  const response = await fetch(
    `https://6e7e-2402-8100-2046-d965-1038-d560-fe30-1a3.in.ngrok.io?text=${encoded_text}&isURL=0`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      agent,
    }
  );
  const data = await response.json();

  const positive = data.positive;
  const negative = data.negative;
  const neutral = data.neutral;

  const percent = {};

  const max = Math.max(Number(positive), Number(negative), Number(neutral));
  if (max === positive) {
    percent['Positive'] = max * 100;
  } else if (max === negative) {
    percent['Pegative'] = max * 100;
  } else {
    percent['Neutral'] = max * 100;
  }

  res.render('results', {
    title: 'SMART | Result',
    shared_data,
    positive,
    negative,
    neutral,
    percent,
    trimmed_string,
  });
});

router.get('/results', async (req, res) => {
  res.redirect('/dashboard');
});

router.get('/fake_news', (req, res) => {
  res.render('fake_news', {
    shared_data,
    title: 'SMART | Sentiment Analysis',
  });
});

router.post('/fake_news', async (req, res) => {
  const agent = new https.Agent({
    rejectUnauthorized: false,
  });

  let trimmed_string;

  const text = req.body.url;
  if (text.length > 400) {
    trimmed_string = text.substring(0, 600) + '...';
  } else {
    trimmed_string = text;
  }

  // console.log(trimmed_string);

  // console.log(text);
  const encoded_text = encodeURIComponent(text.trim());
  // console.log(encoded_text);

  const response = await fetch(
    `https://be24-2402-8100-2040-8118-b09c-4184-cfcf-32b8.in.ngrok.io/fake_news?text=${encoded_text}&isURL=0`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      agent,
    }
  );
  const data = await response.json();
  console.log(data);

  res.render('news_result', {
    title: 'Fake News Result',
    trimmed_string,
    result: data,
    shared_data,
  });
});

router.get('/product_mining', (req, res) => {
  res.render('sentiment', {
    shared_data,
    title: 'SMART | Sentiment Analysis',
  });
});

router.get('/news', (req, res) => {
  res.render('news', {
    shared_data,
    title: 'SMART | News',
  });
});

router.post('/news', async (req, res) => {
  const agent = new https.Agent({
    rejectUnauthorized: false,
  });

  const topic = req.body.topic;
  news_topic = topic;
  const encoded_topic = encodeURIComponent(topic.trim());
  // console.log(encoded_topic);

  const response = await fetch(
    `https://newsapi.org/v2/everything?q=${encoded_topic}&from=2022-11-01&sortBy=publishedAt&apiKey=ab2424601f254d719d41af7d70f9798d`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      agent,
    }
  );
  news_feed = await response.json();

  res.redirect('/news_feed');
  // console.log(news_feed);
});

router.get('/news_feed', (req, res) => {
  if(news_feed.status !== 'ok') {
    console.log('Error! Unable to fetch the requested news.');
  } else {
    const news_list = news_feed.articles.slice(0, 25);

    res.render('news_feed', {
      title: 'SMART | News Feed',
      news_list,
      topic: news_topic,
      shared_data,
    });
  }

  // res.render('news_feed', {
  //   title: 'SMART | News Feed',
  //   // news_list,
  //   news_topic,
  //   shared_data,
  // });
});

// GOOGLE OAUTH

router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/signup' }),
  async function (req, res) {
    const user = req.user;
    const token = await user.generateAuthToken();

    res.cookie('jwt', token, {
      httpOnly: true,
      secure: false,
    });

    shared_data.user_is_authenticated = true;

    res.status(201).redirect('/'); // REDIRECT TO REGISTRATION FORM AFTER SIGNUP
  }
);

// TWITTER OAUTH

router.get(
  '/twitter',
  passport.authenticate('twitter', { scope: ['user:email'] })
);

router.get(
  '/twitter/callback',
  passport.authenticate('twitter', { failureRedirect: '/signup' }),

  async function (req, res) {
    const user = req.user;
    const token = await user.generateAuthToken();

    res.cookie('jwt', token, {
      httpOnly: true,
      secure: false,
    });

    shared_data.user_is_authenticated = true;

    res.status(201).redirect('/'); // REDIRECT TO REGISTRATION FORM AFTER SIGNUP
  }
);

router.get('/logout', auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });

    await req.user.save();

    res.redirect('/');
  } catch (e) {
    res.status(500).send();
  }
});

export default router;
