const validationError = require('mongoose').Error.ValidationError;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const User = require('../models/user');
const BadRequest = require('../errors/BadRequest');
const Conflict = require('../errors/Conflict');

const { NODE_ENV, JWT_SECRET } = process.env;

module.exports.getUserInfo = (req, res, next) => {
  User.findById(req.user._id).select('-password')
    .then(((data) => res.send(data)))
    .catch(next);
};

module.exports.updateUser = (req, res, next) => {
  const { email, name } = req.body;
  User.findByIdAndUpdate(req.user._id, { email, name }, { new: true, runValidators: true })
    .then(((user) => res.send({ data: user })))
    .catch((err) => {
      if (err.code === 11000) {
        next(new Conflict('Данный Email уже используется'));
      }
      if (err instanceof validationError) {
        next(new BadRequest('Ошибка при валидации'));
      } else {
        next(err);
      }
    });
};

module.exports.createUser = (req, res, next) => {
  const {
    name,
    email,
  } = req.body;
  bcrypt.hash(req.body.password, 10)
    .then((hashedPassword) => {
      User.create({
        email,
        password: hashedPassword,
        name,
      })
        .then(((user) => {
          const userWithoutPassword = user.toObject();
          delete userWithoutPassword.password;
          res.send({ data: userWithoutPassword });
        }))
        .catch((err) => {
          if (err.code === 11000) {
            next(new Conflict('Данный email уже используется'));
          }
          if (err instanceof validationError) {
            next(new BadRequest('Ошибка при валидации'));
          } else {
            next(err);
          }
        });
    })
    .catch(next);
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret',
        { expiresIn: '7d' },
      );
      const userAgent = req.get('User-Agent');
      const regEx = /Chrome\/\d+/;
      if (userAgent.match(regEx) && userAgent.match(regEx).toString().replace('Chrome/', '') > 80) {
        res.cookie('jwt', token, {
          maxAge: 3600000 * 24 * 7,
          httpOnly: true,
          sameSite: 'None',
          secure: true,
        });
      } else {
        res.cookie('jwt', token, {
          maxAge: 3600000 * 24 * 7,
          httpOnly: true,
          sameSite: 'Strict',
        });
      }
      res.send({ jwt: token })
        .end();
    })
    .catch((err) => {
      next(err);
    });
};

module.exports.logout = (req, res) => {
  const userAgent = req.get('User-Agent');
  const regEx = /Chrome\/\d+/;
  if (userAgent.match(regEx) && userAgent.match(regEx).toString().replace('Chrome/', '') > 80) {
    res.clearCookie('jwt', {
      sameSite: 'None',
      secure: true,
    });
  } else {
    res.clearCookie('jwt', {
      sameSite: 'Strict',
    });
  }
  res.send({ message: 'Выход' });
};
