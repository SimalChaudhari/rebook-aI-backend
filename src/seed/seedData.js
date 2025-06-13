const mongoose = require('mongoose');
const Customer = require('../models/Customer');
const Service = require('../models/Service');
const Rating = require('../models/Rating');
require('dotenv').config();

const testCustomers = [
  {
    userId: 'cust001',
    fullName: 'Rahul Sharma',
    phoneNumber: '+919876543210',
    email: 'rahul@example.com',
    businessId: 'business123',
    lastVisitDate: new Date('2024-03-15'),
    assignedStaff: 'Rajesh Kumar',
    lastService: 'Hair Cut',
    transactionValue: 500,
    status: 'Active',
    averageVisitInterval: 30,
    spendingPattern: {
      averageSpend: 500,
      totalSpent: 1000,
      lastPayment: 500
    },
    averageRating: 5,
    lastRating: 5,
    lastExperience: 'Positive'
  },
  {
    userId: 'cust002',
    fullName: 'Priya Patel',
    phoneNumber: '+919876543211',
    email: 'priya@example.com',
    businessId: 'business123',
    lastVisitDate: new Date('2024-02-01'),
    assignedStaff: 'Sunita Sharma',
    lastService: 'Hair Color',
    transactionValue: 2000,
    status: 'At Risk',
    averageVisitInterval: 30,
    spendingPattern: {
      averageSpend: 1250,
      totalSpent: 2500,
      lastPayment: 2000
    },
    averageRating: 4,
    lastRating: 4,
    lastExperience: 'Positive'
  },
  {
    userId: 'cust003',
    fullName: 'Amit Verma',
    phoneNumber: '+919876543212',
    email: 'amit@example.com',
    businessId: 'business123',
    lastVisitDate: new Date('2024-01-01'),
    assignedStaff: 'Rajesh Kumar',
    lastService: 'Hair Cut',
    transactionValue: 500,
    status: 'Lost',
    averageVisitInterval: 30,
    spendingPattern: {
      averageSpend: 500,
      totalSpent: 500,
      lastPayment: 500
    },
    averageRating: 3,
    lastRating: 3,
    lastExperience: 'Negative'
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Clear existing data
    await Customer.deleteMany({});
    console.log('Cleared existing data');

    // Insert test data
    await Customer.insertMany(testCustomers);
    console.log('Test data inserted successfully');

    // सारी services लाने के लिए
    const services = await Service.find({ customerId: 'cust001', businessId: 'business123' });

    // सारी ratings लाने के लिए
    const ratings = await Rating.find({ customerId: 'cust001', businessId: 'business123' });

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');

  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed function
seedDatabase(); 