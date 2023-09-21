const express = require('express');
const mongoose = require('mongoose');
const { errors } = require('celebrate');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
require('dotenv').config();
const router = require('./routes/index');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const limiter = require('./middlewares/limiter');

const INTERNAL_SERVER_ERROR = 500;
const { PORT = 3000, NODE_ENV, DATABASE = 'mongodb://127.0.0.1:27017/bitfilmsdb' } = process.env;

mongoose.connect(NODE_ENV === 'production' ? DATABASE : 'mongodb://127.0.0.1:27017/bitfilmsdb', {
  useNewUrlParser: true,
});

const corsOptions = {
  origin: ['http://localhost:3000',
    'https://albinamakarova.nomoredomainsrocks.ru',
    'https://api.albinamakarova.nomoredomainsrocks.ru',
    'http://albinamakarova.nomoredomainsrocks.ru',
    'http://api.albinamakarova.nomoredomainsrocks.ru'],
  credentials: true,
};

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(helmet());

app.use(cors(corsOptions));
app.use(requestLogger);
app.use('/', limiter);
app.use('/', router);

app.use(errorLogger);

app.use(errors());

app.use((err, req, res, next) => {
  if (err.statusCode) {
    res.status(err.statusCode).send({ message: err.message });
  } else {
    res.status(INTERNAL_SERVER_ERROR).send({ message: 'Произошла ошибка' });
  }
  next();
});

app.listen(PORT, () => {
});
