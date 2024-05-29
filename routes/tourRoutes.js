const express = require('express');
const fs = require('fs');

const {
  getAllTours,
  getTour,
  createTour,
  updateTour,
  deleteTour,
  checkId,
  checkBody,
} = require('../controllers/tourController');

const router = express.Router();

router.param('id', checkId);

router
  .route('/')
  .get(getAllTours)
  .post(checkBody, createTour);
router
  .route('/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(deleteTour);

module.exports = router;
