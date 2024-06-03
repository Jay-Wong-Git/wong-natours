/* eslint-disable import/no-extraneous-dependencies */
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// GLOBAL MIDDLEWARES

// SET HTTP SECURITY HEADERS
app.use(helmet());

// DEVELOPMENT LOGGING
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// LIMIT REQUESTS FROM THE SAME IP
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP. Please try again in ONE HOUR!',
});
app.use('/api', limiter);

// BODY PARSER, READING DATE FROM body INTO req.body
app.use(express.json({ limit: '10kb' })); // access request body

// DATA SANITIZATION AGAINST NO-SQL QUERY INJECTION
app.use(mongoSanitize()); // {"email": {"$gt": ""}, "password": "your-pass"}

// DATA SANITIZATION AGAINST XSS
app.use(xss());

// SERVING STATIC FILES
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
