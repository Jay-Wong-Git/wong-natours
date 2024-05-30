/* eslint-disable import/no-extraneous-dependencies */
const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a name'],
    unique: true,
  },
  price: { type: Number, default: 4.5 },
  rating: {
    type: Number,
    required: [true, 'A tour must have a price'],
  },
});

module.exports = mongoose.model('Tour', tourSchema);
