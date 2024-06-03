const APIFeatures = require('../utils/apiFeatures');
const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');
const handlerFactory = require('./handlerFactory');

exports.getAllReviews = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Review.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  if (req.params.tourId)
    features.query = features.query.find({ tour: req.params.tourId });
  const reviews = await features.query;

  return res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: reviews.length,
    data: { reviews },
  });
});

exports.createReview = catchAsync(async (req, res, next) => {
  // allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;

  const review = await Review.create(req.body);
  return res.status(201).json({
    status: 'success',
    requestedAt: req.requestTime,
    data: { review },
  });
});

exports.deleteReview = handlerFactory.deleteOne(Review);
