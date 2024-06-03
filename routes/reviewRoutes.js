const express = require('express');

const {
  getAllReviews,
  createReview,
  deleteReview,
} = require('../controllers/reviewController');

const { protect, restrictTo } = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(protect, getAllReviews)
  .post(protect, restrictTo('user'), createReview);

router.route('/:id').delete(protect, restrictTo('admin'), deleteReview);

module.exports = router;
