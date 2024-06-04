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
const reviewRouter = require('./reviewRoutes');

const router = express.Router();

// router.param('id', checkId);

// API Alias
router.route('/top-5-cheap').get(aliasTopTours, getAllTours);

// Aggregation Pipeline
router.route('/tour-stats').get(getTourStats);
router
  .route('/month-plan/:year')
  .get(protect, restrictTo('admin', 'lead-guide', 'guide '), getMonthlyPlan);

// API
router
  .route('/')
  .get(getAllTours)
  .post(protect, restrictTo('admin', 'lead-guide'), createTour);
router
  .route('/:id')
  .get(getTour)
  .patch(protect, restrictTo('admin', 'lead-guide'), updateTour)
  .delete(protect, restrictTo('admin', 'lead-guide'), deleteTour);

// Config nested routes
// router
//   .route('/:tourId/reviews')
//   .post(protect, restrictTo('user'), createReview);
router.use('/:tourId/reviews', reviewRouter);

module.exports = router;
