const fs = require('fs');

let tours = JSON.parse(
  fs.readFileSync(
    `${__dirname}/../dev-data/data/tours-simple.json`,
    'utf-8',
  ),
);

// MIDDLEWARES

exports.checkId = (req, res, next, val) => {
  const id = Number(req.params.id);
  if (id < 0 || id >= tours.length)
    return res.status(404).json({
      status: 'fail',
      requestedAt: req.requestTime,
      msg: 'Invalid ID',
    });
  next();
};

exports.checkBody = (req, res, next) => {
  const { name, price } = req.body;
  if (!name || !price) {
    return res.status(400).json({
      status: 'fail',
      msg: 'Missing name or price',
    });
  }
  next();
};

// CONTROLLERS

exports.getAllTours = (req, res) =>
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: tours.length,
    data: { tours },
  });

exports.getTour = (req, res) => {
  const id = Number(req.params.id);
  const tour = tours.find((el) => el.id === id);
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    data: { tour },
  });
};

exports.createTour = (req, res) => {
  const newId = tours.at(-1).id + 1;
  // eslint-disable-next-line node/no-unsupported-features/es-syntax
  const newTour = { id: newId, ...req.body };
  tours.push(newTour);
  fs.writeFile(
    `${__dirname}/../dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      if (err) {
        return res.status(500).json({
          status: 'fail',
          requestedAt: req.requestTime,
          msg: 'System error',
        });
      }
      return res.status(201).json({
        status: 'success',
        requestedAt: req.requestTime,
        data: { tour: newTour },
      });
    },
  );
};

exports.updateTour = (req, res) => {
  const id = Number(req.params.id);
  const tour = tours.find((el) => el.id === id);
  Object.assign(tour, req.body);
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      if (err) {
        return res.status(500).json({
          status: 'fail',
          requestedAt: req.requestTime,
          msg: 'Server error',
        });
      }
      return res.status(200).json({
        status: 'success',
        requestedAt: req.requestTime,
        data: { tour },
      });
    },
  );
};

exports.deleteTour = (req, res) => {
  const id = Number(req.params.id);
  tours = tours.filter((el) => el.id !== id);
  fs.writeFile(
    `${__dirname}/../dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      if (err) {
        return res.status(500).json({
          status: 'fail',
          requestedAt: req.requestTime,
          msg: 'Server error',
        });
      }
      return res.status(204).json({
        status: 'success',
        requestedAt: req.requestTime,
        data: null,
      });
    },
  );
};
