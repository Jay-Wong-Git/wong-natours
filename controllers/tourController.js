const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');

exports.aliasTopTours = async (req, res, next) => {
  req.query.fields = 'price,summary,ratingsAverage,difficulty';
  req.query.sort = '-ratingsAverage,price';
  req.query.limit = 5;
  next();
};

exports.getAllTours = catchAsync(async (req, res, next) => {
  /*
    // BUILD QUERY
    // 1.1) Filtering
    let queryObj = { ...req.query };
    const excludedFields = ['sort', 'page', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // 1.2) Advance filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
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
      if (skip >= numTours) throw new Error("This page doesn't exist");
    }

    query = query.skip(skip).limit(limit);
    */
  // EXECUTE QUERY
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const tours = await features.query;

  // SEND RESPONSE
  return res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: tours.length,
    data: { tours },
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  // const tour = await Tour.findOne({ _id: req.params.id });
  const tour = await Tour.findById(req.params.id);
  return res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    data: { tour },
  });
});

exports.createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);
  return res.status(201).json({
    status: 'success',
    requestedAt: req.requestTime,
    data: { tour: newTour },
  });
});

exports.updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  return res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    data: { tour },
  });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  await Tour.findByIdAndDelete(req.params.id);
  return res.status(204).json({
    status: 'success',
    requestedAt: req.requestTime,
    data: null,
  });
});

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    // match stage
    { $match: { ratingsAverage: { $gte: 4.5 } } },
    // group stage
    {
      $group: {
        // _id: '$difficulty',
        // _id: '$ratingsAverage',
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    // sort stage
    {
      // $sort: { avgPrice: 1 },
      $sort: { avgRating: -1 },
    },
    // second match
    /*
      {
        // $match: { avgRating: { $gte: 4.7 } },
        $match: { _id: { $ne: 'EASY' } },
      },
      */
  ]);
  return res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: stats.length,
    data: { stats },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    // unwind stage
    { $unwind: '$startDates' },
    // match stage
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    // group stage
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    // add fields stage
    {
      $addFields: { month: '$_id' },
    },
    // project stage
    {
      $project: { _id: 0 },
    },
    // sort stage
    {
      // $sort: { month: 1 },
      $sort: { numTourStarts: -1 },
    },
    // limit stage
    // { $limit: 3 },
  ]);

  return res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: plan.length,
    data: { plan },
  });
});
