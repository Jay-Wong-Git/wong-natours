const Tour = require('../models/tourModel');

exports.getAllTours = async (req, res) => {
  try {
    const tours = await Tour.find();
    return res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      results: tours.length,
      data: { tours },
    });
  } catch (err) {
    return res
      .status(500)
      .json({ status: 'fail', msg: err.message });
  }
};

exports.getTour = async (req, res) => {
  try {
    // const tour = await Tour.findOne({ _id: req.params.id });
    const tour = await Tour.findById(req.params.id);
    return res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      data: { tour },
    });
  } catch (err) {
    return res
      .status(404)
      .json({ status: 'fail', msg: err.message });
  }
};

exports.createTour = async (req, res) => {
  try {
    // const newTour = new Tour(req.body);
    // await newTour.save()
    const newTour = await Tour.create(req.body);
    return res.status(201).json({
      status: 'success',
      requestedAt: req.requestTime,
      data: { tour: newTour },
    });
  } catch (err) {
    return res
      .status(400)
      .json({ status: 'fail', msg: err.message });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    );
    return res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      data: { tour },
    });
  } catch (err) {
    return res
      .status(500)
      .json({ status: 'fail', msg: err.message });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    return res.status(204).json({
      status: 'success',
      requestedAt: req.requestTime,
      data: null,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ status: 'fail', msg: err.message });
  }
};
