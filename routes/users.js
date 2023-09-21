const userRouter = require('express').Router();
const auth = require('../middlewares/auth');
const { validationUserInfo } = require('../middlewares/validation');
const { getUserInfo, updateUser } = require('../controllers/users');

userRouter.use(auth);
userRouter.get('/me', getUserInfo);
userRouter.patch('/me', validationUserInfo, updateUser);

module.exports = userRouter;
