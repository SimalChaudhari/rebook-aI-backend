const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema({
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
  date: {
    type: Date,
    required: true
  },
  service: String,
  staff: String,
  amount: Number
}, { timestamps: true });

module.exports = mongoose.model('Visit', visitSchema); 