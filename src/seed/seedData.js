const mongoose = require('mongoose');
const Customer = require('../models/Customer');
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
    visitHistory: [
      {
        date: new Date('2024-03-15'),
        service: 'Hair Cut',
        staff: 'Rajesh Kumar',
        amount: 500
      },
      {
        date: new Date('2024-02-15'),
        service: 'Hair Cut',
        staff: 'Rajesh Kumar',
        amount: 500
      }
    ],
    averageVisitInterval: 30,
    preferredServices: ['Hair Cut', 'Hair Spa'],
    spendingPattern: {
      averageSpend: 500,
      totalSpent: 1000,
      lastPayment: 500
    },
    ratings: [
      {
        date: new Date('2024-03-15'),
        rating: 5,
        feedback: 'Excellent service, very professional'
      }
    ],
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
    visitHistory: [
      {
        date: new Date('2024-02-01'),
        service: 'Hair Color',
        staff: 'Sunita Sharma',
        amount: 2000
      },
      {
        date: new Date('2024-01-01'),
        service: 'Hair Cut',
        staff: 'Sunita Sharma',
        amount: 500
      }
    ],
    averageVisitInterval: 30,
    preferredServices: ['Hair Color', 'Hair Spa'],
    spendingPattern: {
      averageSpend: 1250,
      totalSpent: 2500,
      lastPayment: 2000
    },
    ratings: [
      {
        date: new Date('2024-02-01'),
        rating: 4,
        feedback: 'Good service, friendly staff'
      }
    ],
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
    visitHistory: [
      {
        date: new Date('2024-01-01'),
        service: 'Hair Cut',
        staff: 'Rajesh Kumar',
        amount: 500
      }
    ],
    averageVisitInterval: 30,
    preferredServices: ['Hair Cut'],
    spendingPattern: {
      averageSpend: 500,
      totalSpent: 500,
      lastPayment: 500
    },
    ratings: [
      {
        date: new Date('2024-01-01'),
        rating: 3,
        feedback: 'Average service, could be better'
      }
    ],
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