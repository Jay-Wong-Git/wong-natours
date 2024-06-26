/* eslint-disable import/no-extraneous-dependencies */
const path = require('path');
const mongoose = require('mongoose');

const dotenv = require('dotenv');

// HANDLE UNCAUGHT EXCEPTION
process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  process.exit(1);
});

dotenv.config({ path: path.join(__dirname, 'config.env') });
const app = require('./app');

const DB = process.env.MONGODB_URL.replace(
  '<PASSWORD>',
  process.env.MONGODB_PASSWORD,
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log('DB connection successful'));

const port = process.env.PORT;
const server = app.listen(port, () => {
  console.log(`App running on ${port}...`);
});

// HANDLE UNHANDLED REJECTION
process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  server.close(() => {
    process.exit(1);
  });
});
