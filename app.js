/* eslint-disable import/no-extraneous-dependencies */
const path = require('path');
const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const compression = require('compression');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');
const bookingRouter = require('./routes/bookingRoutes');

const app = express();

app.enable('trust proxy');

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views')); // Always use path.join to avoid some bugs about "/"

// GLOBAL MIDDLEWARES

// SET HTTP SECURITY HEADERS
app.use(
  helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }),
);

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
app.use(express.json({ limit: '10kb' })); // parse data from json
app.use(express.urlencoded({ extended: true, limit: '10kb' })); // parse data from url encoded form

// COOKIE PARSER
app.use(cookieParser());

// DATA SANITIZATION AGAINST NO-SQL QUERY INJECTION
app.use(mongoSanitize()); // {"email": {"$gt": ""}, "password": "your-pass"}

// DATA SANITIZATION AGAINST XSS
app.use(xss());

// PREVENT PARAMETER POLLUTION
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  }),
);

app.use(compression());

// SERVING STATIC FILES
app.use(express.static(path.join(__dirname, 'public'))); // static files

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
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

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
