const Review = require('../models/reviewModel');
const handlerFactory = require('./handlerFactory');

exports.setTourUserIds = (req, res, next) => {
  // To allow nested routes when create review
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.createReview = handlerFactory.createOne(Review);
exports.deleteReview = handlerFactory.deleteOne(Review);
exports.updateReview = handlerFactory.updateOne(Review);
exports.getReview = handlerFactory.getOne(Review);
exports.getAllReviews = handlerFactory.getAll(Review);
