const router = require('express').Router();
const userRouter = require('./users');
const movieRouter = require('./movies');
const NotFound = require('../errors/NotFound');

const {
  createUser,
  login,
  logout,
} = require('../controllers/users');

const {
  validationLogin,
  validationRegister,
} = require('../middlewares/validation');

router.post('/signin', validationLogin, login);
router.post('/signup', validationRegister, createUser);
router.get('/signout', logout);
router.use('/users', userRouter);
router.use('/movies', movieRouter);
router.use('*', (req, res, next) => {
  next(new NotFound('Страница не найдена'));
});

module.exports = router;
