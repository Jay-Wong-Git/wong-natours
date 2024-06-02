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

const { secure } = require('../controllers/authController');

const router = express.Router();

// router.param('id', checkId);

// API Alias
router.route('/top-5-cheap').get(aliasTopTours, secure, getAllTours);

// Aggregation Pipeline
router.route('/tour-stats').get(secure, getTourStats);
router.route('/month-plan/:year').get(secure, getMonthlyPlan);

// API
router.route('/').get(secure, getAllTours).post(secure, createTour);
router
  .route('/:id')
  .get(secure, getTour)
  .patch(secure, updateTour)
  .delete(secure, deleteTour);

module.exports = router;
