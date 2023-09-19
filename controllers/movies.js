const validationError = require('mongoose').Error.ValidationError;
const castError = require('mongoose').Error.CastError;
const Movie = require('../models/movie');
const BadRequest = require('../errors/BadRequest');
const Forbidden = require('../errors/Forbidden');
const NotFound = require('../errors/NotFound');

module.exports.getMovies = (req, res, next) => {
  Movie.find({ owner: req.user._id })
    .then((data) => res.send(data))
    .catch(next);
};

module.exports.postMovie = (req, res, next) => {
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    thumbnail,
    movieId,
    nameRU,
    nameEN,
  } = req.body;
  const movieData = {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    thumbnail,
    movieId,
    nameRU,
    nameEN,
    owner: req.user._id,
  };
  Movie.create(movieData)
    .then((movie) => {
      res.send({ data: movie });
    })
    .catch((err) => {
      if (err instanceof validationError) {
        next(new BadRequest('Ошибка при валидации'));
      } else {
        next(err);
      }
    });
};

module.exports.deleteMovie = (req, res, next) => {
  const { movieId } = req.params;
  Movie.findById(movieId)
    .then((data) => {
      if (data === null) {
        return next(new NotFound('Фильм с указанным id не найден'));
      }
      if (!(data.owner.toString() === req.user._id)) {
        return next(new Forbidden('Вы не можете удалять фильмы добавленные другими пользователями'));
      }
      Movie.findByIdAndRemove(movieId)
        .then((movie) => {
          if (movie) {
            return res.send({ message: 'Фильм удален' });
          }
          return null;
        })
        .catch((err) => {
          if (err instanceof castError) {
            next(new BadRequest('Передан некорректный id фильма'));
          } else { next(err); }
        });
      return null;
    })
    .catch(next);
};
