/* eslint-disable import/no-extraneous-dependencies */
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// GLOBAL MIDDLEWARES

// LOGGER
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// RATE LIMITER
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP. Please try again in ONE HOUR!',
});
app.use('/api', limiter);

// PARSE JSON
app.use(express.json()); // access request body

// STATIC FILES
app.use(express.static(`${__dirname}/public`)); // static files

// DIY CONSOLE MESSAGE
// app.use((req, res, next) => {
//   console.log('Hello from the middleware 👋');
//   next();
// });

// DIY REQUEST PROPERTY
app.use((req, res, next) => {
  req.requestTime = `⏰ ${new Date().toLocaleString()}`;
  next();
});

// ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// CONFIG 404
app.all('*', (req, res, next) => {
  const err = new AppError(
    `Can't find '${req.originalUrl}' on the server`,
    404,
  );

  next(err);
});

// ERROR HANDLER
app.use(globalErrorHandler);

module.exports = app;
