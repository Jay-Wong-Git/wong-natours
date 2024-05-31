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

const router = express.Router();

// router.param('id', checkId);

// API Alias
router.route('/top-5-cheap').get(aliasTopTours, getAllTours);

// Aggregation Pipeline
router.route('/tour-stats').get(getTourStats);
router.route('/month-plan/:year').get(getMonthlyPlan);

// API
router.route('/').get(getAllTours).post(createTour);
router.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

module.exports = router;
