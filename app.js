const express = require('express');
const mongoose = require('mongoose');
const { errors } = require('celebrate');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const router = require('./routes/index');
const { requestLogger, errorLogger } = require('./middlewares/logger');

const INTERNAL_SERVER_ERROR = 500;
const { PORT = 3100, DATABASE = 'mongodb://127.0.0.1:27017/bitfilmsdb' } = process.env;

mongoose.connect(DATABASE, {
  useNewUrlParser: true,
});

const corsOptions = {
  origin: ['http://localhost:3000',
    'https://bjelkier.nomoredomainsicu.ru',
    'https://api.bjelkier.nomoredomainsicu.ru',
    'http://bjelkier.nomoredomainsicu.ru',
    'http://api.bjelkier.nomoredomainsicu.ru'],
  credentials: true,
};

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(helmet());

app.use(cors(corsOptions));
app.use(requestLogger);
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
