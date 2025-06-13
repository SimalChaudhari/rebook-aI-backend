const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Referral = require('../models/Referral');

dotenv.config();

const testReferrals = [
  {
    referralCode: 'business123-cust001-1718100000000-abc12345',
    businessId: 'business123',
    referrerUserId: 'cust001',
    clicks: 2,
    conversions: 1,
    convertedUserIds: ['cust002'],
    lastClickedAt: new Date(),
    lastConvertedAt: new Date()
  },
  {
    referralCode: 'business123-cust002-1718100000001-def67890',
    businessId: 'business123',
    referrerUserId: 'cust002',
    clicks: 0,
    conversions: 0,
    convertedUserIds: [],
    lastClickedAt: null,
    lastConvertedAt: null
  }
];

async function seedReferral() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    await Referral.deleteMany();
    console.log('Cleared existing referral data');

    await Referral.insertMany(testReferrals);
    console.log('Test referral data inserted successfully');

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error seeding referral data:', error);
  }
}

seedReferral(); 