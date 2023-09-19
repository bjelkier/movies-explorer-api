const movieRouter = require('express').Router();
const { getMovies, postMovie, deleteMovie } = require('../controllers/movies');
const auth = require('../middlewares/auth');
const { validationMovieInfo, validationMovieId } = require('../middlewares/validation');

movieRouter.use(auth);
movieRouter.get('/', getMovies);
movieRouter.post('/', validationMovieInfo, postMovie);
movieRouter.delete('/:movieId', validationMovieId, deleteMovie);

module.exports = movieRouter;
