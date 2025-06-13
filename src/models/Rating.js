const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  customerId: {
    type: String,
    required: true,
    ref: 'Customer'
  },
  businessId: {
    type: String,
    required: true,
    ref: 'Business'
  },
  rating: {
    type: Number,
    required: true
  },
  feedback: String,
  date: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Rating', ratingSchema); 