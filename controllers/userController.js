/* eslint-disable import/no-extraneous-dependencies */
const multer = require('multer');
const sharp = require('sharp');

const catchAsync = require('../utils/catchAsync');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const handlerFactory = require('./handlerFactory');

// Config Multer to upload user photo
// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });
const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please only upload images!', 400));
  }
};
const upload = multer({ storage: multerStorage, fileFilter: multerFilter });
exports.uploadUserPhoto = upload.single('photo');

// Resize and format user photo
exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();
  // For memoryStorage, there is no filename yet, need to manually set a filename to use later
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);
  return next();
});

// To filter out unwanted field names that are not allowed to be updated
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

// Middleware to inject user id
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm)
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword',
        400,
      ),
    );

  // 2) Filter out unwanted field names that are not allowed to be updated
  const filteredBody = filterObj(req.body, 'name', 'email');
  if (req.file) filteredBody.photo = req.file.filename;

  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user._id, filteredBody, {
    new: true,
    runValidators: true,
  });

  return res
    .status(200)
    .json({ status: 'success', data: { user: updatedUser } });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });
  return res.status(204).json({ status: 'success', data: null });
});

// Undefined route
exports.createUser = (req, res) =>
  res.status(500).json({
    status: 'fail',
    msg: 'This route is not defined. Please use /signup instead!',
  });

exports.getUser = handlerFactory.getOne(User);
exports.getAllUsers = handlerFactory.getAll(User);
exports.deleteUser = handlerFactory.deleteOne(User);
// DO NOT update password with this!
exports.updateUser = handlerFactory.updateOne(User);
