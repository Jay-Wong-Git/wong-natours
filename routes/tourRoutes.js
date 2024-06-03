const express = require('express');

const {
  getAllTours,
  getTour,
  createTour,
  updateTour,
  deleteTour,
  aliasTopTours,
  getTourStats,
  getMonthlyPlan,
} = require('../controllers/tourController');
const { protect, restrictTo } = require('../controllers/authController');
const { createReview } = require('../controllers/reviewController');

const router = express.Router();

// router.param('id', checkId);

// API Alias
router.route('/top-5-cheap').get(aliasTopTours, protect, getAllTours);

// Aggregation Pipeline
router.route('/tour-stats').get(protect, getTourStats);
router.route('/month-plan/:year').get(protect, getMonthlyPlan);

// API
router.route('/').get(protect, getAllTours).post(protect, createTour);
router
  .route('/:id')
  .get(protect, getTour)
  .patch(protect, updateTour)
  .delete(protect, restrictTo('admin', 'lead-guide'), deleteTour);

// Config nested routes
router
  .route('/:tourId/reviews')
  .post(protect, restrictTo('user'), createReview);

module.exports = router;
