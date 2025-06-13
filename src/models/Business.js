const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema({
  businessId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  ownerName: { type: String },
  phoneNumber: { type: String },
  email: { type: String },
  address: { type: String },
  whatsappNumber: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Business', businessSchema); 