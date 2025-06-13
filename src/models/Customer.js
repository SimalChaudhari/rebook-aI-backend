const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  fullName: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  email: String,
  businessId: {
    type: String,
    required: true
  },
  lastVisitDate: Date,
  assignedStaff: {
    type: String,
    ref: 'Staff'
  },
  lastService: String,
  transactionValue: Number,
  visitHistory: [{
    date: Date,
    service: String,
    staff: String,
    amount: Number
  }],
  status: {
    type: String,
    enum: ['Active', 'At Risk', 'Lost', 'Recovered', 'New'],
    default: 'New'
  },
  averageVisitInterval: Number,
  preferredServices: [String],
  spendingPattern: {
    averageSpend: Number,
    totalSpent: Number,
    lastPayment: Number
  },
  ratings: [{
    date: Date,
    rating: Number,
    feedback: String
  }],
  averageRating: {
    type: Number,
    default: 0
  },
  lastRating: Number,
  lastExperience: {
    type: String,
    enum: ['Positive', 'Negative'],
    default: 'Positive'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
customerSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Calculate average visit interval
customerSchema.methods.calculateAverageVisitInterval = function() {
  if (this.visitHistory.length < 2) return null;
  
  const intervals = [];
  for (let i = 1; i < this.visitHistory.length; i++) {
    const interval = this.visitHistory[i].date - this.visitHistory[i-1].date;
    intervals.push(interval / (1000 * 60 * 60 * 24)); // Convert to days
  }
  
  this.averageVisitInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  return this.averageVisitInterval;
};

// Update customer status based on visit history
customerSchema.methods.updateStatus = function() {
  const now = new Date();
  const lastVisit = this.lastVisitDate;
  
  if (!lastVisit) {
    this.status = 'New';
    return;
  }
  
  const daysSinceLastVisit = (now - lastVisit) / (1000 * 60 * 60 * 24);
  
  if (daysSinceLastVisit <= this.averageVisitInterval + 5) {
    this.status = 'Active';
  } else if (daysSinceLastVisit <= this.averageVisitInterval + 15) {
    this.status = 'At Risk';
  } else {
    this.status = 'Lost';
  }
};

module.exports = mongoose.model('Customer', customerSchema); 