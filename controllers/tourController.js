/* eslint-disable import/no-extraneous-dependencies */
const multer = require('multer');
const sharp = require('sharp');

const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const handlerFactory = require('./handlerFactory');

// Upload tour images
const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please only upload images!', 400));
  }
};
const upload = multer({ storage: multerStorage, fileFilter: multerFilter });
exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);
// upload.single('image')  req.file
// upload.array('images', 5)  req.files
// upload.fields([
//   { name: 'images1', maxCount: 3 },
//   { name: 'images2', maxCount: 4 },
// ]);
exports.resizeTourImages = catchAsync(async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) return next();

  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  // 1) Process cover image
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  // 2) Process images
  req.body.images = [];
  await Promise.all(
    req.files.images.map(async (image, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
      req.body.images.push(filename);
      await sharp(image.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${filename}`);
    }),
  );

  return next();
});

exports.aliasTopTours = async (req, res, next) => {
  req.query.fields = 'price,summary,ratingsAverage,difficulty';
  req.query.sort = '-ratingsAverage,price';
  req.query.limit = 5;
  next();
};

exports.getAllToursDeprecated = catchAsync(async (req, res, next) => {
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

  // const tours = await features.query.populate('guides');
  const tours = await features.query;

  // SEND RESPONSE
  return res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: tours.length,
    data: { tours },
  });
});

exports.getAllTours = handlerFactory.getAll(Tour);

/*
exports.getTour = catchAsync(async (req, res, next) => {
  // const tour = await Tour.findOne({ _id: req.params.id });
  // const tour = await Tour.findById(req.params.id).populate('guides');
  const tour = await Tour.findById(req.params.id).populate({
    path: 'reviews',
    select: '-__v',
  }); // .populate({path: 'reviews', select: '-__v'}) -> VIRTUAL POPULATE stage 2

  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }

  return res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    data: { tour },
  });
});
*/
exports.getTour = handlerFactory.getOne(Tour, 'reviews');

/*
exports.createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);
  return res.status(201).json({
    status: 'success',
    requestedAt: req.requestTime,
    data: { tour: newTour },
  });
});
*/
exports.createTour = handlerFactory.createOne(Tour);

/*
exports.updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }

  return res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    data: { tour },
  });
});
*/
exports.updateTour = handlerFactory.updateOne(Tour);

/*
exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);

  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }

  return res.status(204).json({
    status: 'success',
    requestedAt: req.requestTime,
    data: null,
  });
});
*/
exports.deleteTour = handlerFactory.deleteOne(Tour);

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

exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng)
    return next(
      new AppError(
        'Please provide latitude and longitude in format lat,lng',
        400,
      ),
    );

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  return res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: tours.length,
    data: { data: tours },
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const multiplier = unit === 'mi' ? 0.000621371192 : 0.001;

  if (!lat || !lng)
    return next(
      new AppError(
        'Please provide latitude and longitude in format lat,lng',
        400,
      ),
    );

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        name: 1,
        distance: 1,
      },
    },
  ]);

  return res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: distances.length,
    data: { data: distances },
  });
});
