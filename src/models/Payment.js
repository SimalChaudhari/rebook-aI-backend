const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
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
  serviceId: {
    type: String,
    ref: 'Service'
  },
  amount: {
    type: Number,
    required: true
  },
  paymentDate: {
    type: Date,
    default: Date.now
  },
  paymentMethod: String,
  transactionId: String
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema); 