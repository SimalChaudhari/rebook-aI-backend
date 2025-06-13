const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Business = require('../models/Business');

dotenv.config();

const testBusinesses = [
  {
    businessId: 'business123',
    name: 'Test Salon',
    ownerName: 'Vishal',
    phoneNumber: '+919999999999',
    email: 'testsalon@example.com',
    address: 'Delhi, India',
    whatsappNumber: '+919999999999'
  },
  {
    businessId: 'business124',
    name: 'Beauty Hub',
    ownerName: 'Priya',
    phoneNumber: '+918888888888',
    email: 'beautyhub@example.com',
    address: 'Mumbai, India',
    whatsappNumber: '+918888888888'
  }
];

async function seedBusiness() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    await Business.deleteMany();
    console.log('Cleared existing business data');

    await Business.insertMany(testBusinesses);
    console.log('Test business data inserted successfully');

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error seeding business data:', error);
  }
}

seedBusiness(); 