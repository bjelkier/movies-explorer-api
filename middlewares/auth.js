const jwt = require('jsonwebtoken');
require('dotenv').config();
const WrongData = require('../errors/WrongData');

const { NODE_ENV, JWT_SECRET } = process.env;

module.exports = (req, res, next) => {
  if (!req.cookies.jwt) {
    next(new WrongData('Требуется авторизация'));
  }
  const token = req.cookies.jwt;
  let payload;
  try {
    payload = jwt.verify(token, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret');
  } catch (err) {
    next(new WrongData('Необходима авторизация'));
  }
  req.user = payload;
  next();
};
