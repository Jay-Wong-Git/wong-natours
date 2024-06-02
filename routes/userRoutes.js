const express = require('express');

const {
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
} = require('../controllers/userController');

const {
  signup,
  login,
  resetPassword,
  forgotPassword,
  updatePassword,
  protect,
} = require('../controllers/authController');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);

router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);
router.patch('/updateMyPassword', protect, updatePassword);

router.patch('/updateMe', protect, updateMe);
router.delete('/deleteMe', protect, deleteMe);

router.route('/').get(protect, getAllUsers);

router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
