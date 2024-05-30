const Tour = require('../models/tourModel');

exports.aliasTopTours = async (req, res, next) => {
  req.query.fields =
    'price,summary,ratingsAverage,difficulty';
  req.query.sort = '-ratingsAverage,price';
  req.query.limit = 5;
  next();
};

exports.getAllTours = async (req, res) => {
  try {
    // BUILD QUERY
    // 1.1) Filtering
    let queryObj = { ...req.query };
    const excludedFields = [
      'sort',
      'page',
      'limit',
      'fields',
    ];
    excludedFields.forEach((el) => delete queryObj[el]);

    // 1.2) Advance filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`,
    );
    queryObj = JSON.parse(queryStr);
    let query = Tour.find(queryObj);

    // 2) Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // 3) Fields limiting
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query.select(fields);
    } else {
      query.select('-__v');
    }

    // 4) Pagination
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 10;
    const skip = (page - 1) * limit;

    if (req.query.page) {
      const numTours = await Tour.countDocuments();
      if (skip >= numTours)
        throw new Error("This page doesn't exist");
    }

    query = query.skip(skip).limit(limit);

    // EXECUTE QUERY
    const tours = await query;

    // SEND RESPONSE
    return res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      results: tours.length,
      data: { tours },
    });
  } catch (err) {
    return res
      .status(404)
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
