const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
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
  serviceName: {
    type: String,
    required: true
  },
  staff: String,
  date: {
    type: Date,
    required: true
  },
  amount: Number
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema); 