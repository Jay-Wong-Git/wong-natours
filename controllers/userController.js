const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');
const User = require('../models/userModel');

exports.getAllUsers = catchAsync(async (req, res, next) => {
  // EXECUTE QUERY
  const features = new APIFeatures(User.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const users = await features.query;

  // SEND RESPONSE
  return res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: users.length,
    data: { users },
  });
});

exports.createUser = (req, res) =>
  res.status(500).json({
    status: 'error',
    msg: 'This route is not yet defined!',
  });

exports.getUser = (req, res) =>
  res.status(500).json({
    status: 'error',
    msg: 'This route is not yet defined!',
  });

exports.updateUser = (req, res) =>
  res.status(500).json({
    status: 'error',
    msg: 'This route is not yet defined!',
  });

exports.deleteUser = (req, res) =>
  res.status(500).json({
    status: 'error',
    msg: 'This route is not yet defined!',
  });
