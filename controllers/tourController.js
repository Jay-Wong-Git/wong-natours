const fs = require('fs');

let tours = JSON.parse(
  fs.readFileSync(
    `${__dirname}/../dev-data/data/tours-simple.json`,
    'utf-8'
  )
);

exports.getAllTours = (req, res) => {
  return res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: tours.length,
    data: { tours },
  });
};

exports.getTour = (req, res) => {
  console.log(req.requestTime);
  const id = parseInt(req.params.id);
  if (id < 0 || id >= tours.length)
    return res.status(404).json({
      status: 'fail',
      requestedAt: req.requestTime,
      msg: 'Invalid ID',
    });

  const tour = tours.find((el) => el.id === id);
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    data: { tour },
  });
};

exports.createTour = (req, res) => {
  const newId = tours.at(-1).id + 1;
  // const newTour = Object.assign({ id: newId }, req.body);
  const newTour = { id: newId, ...req.body };
  tours.push(newTour);
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      if (err) {
        console.log(err.message);
        return res.status(500).json({
          status: 'fail',
          requestedAt: req.requestTime,
          msg: 'System error',
        });
      }
      console.log('New tour saved.');
      return res.status(201).json({
        status: 'success',
        requestedAt: req.requestTime,
        data: { tour: newTour },
      });
    }
  );
};

exports.updateTour = (req, res) => {
  const id = parseInt(req.params.id);
  if (id < 0 || id >= tours.length)
    return res.status(404).json({
      status: 'fail',
      requestedAt: req.requestTime,
      msg: 'Invalid ID',
    });

  const tour = tours.find((el) => el.id === id);
  Object.assign(tour, req.body);
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      if (err) {
        console.log('Update failed.');
        return res.status(500).json({
          status: 'fail',
          requestedAt: req.requestTime,
          msg: 'Server error',
        });
      }
      console.log('Update saved.');
      return res.status(200).json({
        status: 'success',
        requestedAt: req.requestTime,
        data: { tour },
      });
    }
  );
};

exports.deleteTour = (req, res) => {
  const id = parseInt(req.params.id);
  if (id < 0 || id >= tours.length)
    return res.status(404).json({
      status: 'fail',
      requestedAt: req.requestTime,
      msg: 'Invalid ID',
    });

  const tour = tours.find((el) => el.id === id);
  tours = tours.filter((el) => el.id !== id);
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      if (err) {
        console.log(err.message);
        return res.status(500).json({
          status: 'fail',
          requestedAt: req.requestTime,
          msg: 'Server error',
        });
      }
      console.log('Tour deleted');
      return res.status(204).json({
        status: 'success',
        requestedAt: req.requestTime,
        data: null,
      });
    }
  );
};
