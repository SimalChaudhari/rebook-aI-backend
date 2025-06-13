const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema({
  referralCode: { type: String, required: true, unique: true },
  businessId: { type: String, required: true },
  referrerUserId: { type: String, required: true }, // जिसने रेफरल बनाया
  createdAt: { type: Date, default: Date.now },
  clicks: { type: Number, default: 0 },
  conversions: { type: Number, default: 0 },
  convertedUserIds: [{ type: String }], // जिन userId ने रेफरल से जॉइन किया
  lastClickedAt: { type: Date },
  lastConvertedAt: { type: Date }
});

module.exports = mongoose.model('Referral', referralSchema); 