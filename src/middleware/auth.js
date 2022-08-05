import jwt from 'jsonwebtoken';
import User from '../models/user.js';

const auth = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (token == null) return res.sendStatus(401);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findOne({
      _id: decoded._id,
      'tokens.token': token,
    });

    if (!user) {
      throw new Error();
    }

    req.token = token;
    req.user = user;
    next();
  } catch (e) {
    res.status(401).send({ error: 'Please authenticate' });
  }
};

export default auth;
