const express = require('express');
const morgan = require('morgan');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// MIDDLEWARES

if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

app.use(express.json()); // access request body

app.use(express.static(`${__dirname}/public`)); // static files

// app.use((req, res, next) => {
//   console.log('Hello from the middleware 👋');
//   next();
// });

app.use((req, res, next) => {
  req.requestTime = `⏰ ${new Date().toLocaleString()}`;
  next();
});

// ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
  res.status(404).json({
    status: 'fail',
    msg: `Can't find '${req.originalUrl}' on the server`,
  });
});

module.exports = app;
