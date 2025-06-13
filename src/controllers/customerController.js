const Customer = require('../models/Customer');
const Service = require('../models/Service');
const Rating = require('../models/Rating');
const Payment = require('../models/Payment');
const Visit = require('../models/Visit');

exports.getCustomers = async (req, res) => {
  try {
    const { businessId, status, search, sortBy, sortOrder } = req.query;
    
    // Build query
    const query = {};
    if (businessId) query.businessId = businessId;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort options
    const sortOptions = {};
    if (sortBy) {
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    } else {
      sortOptions.lastVisitDate = -1; // Default sort by last visit
    }

    const customers = await Customer.find(query)
      .sort(sortOptions)
      .select('userId fullName email phoneNumber status averageRating lastRating lastExperience lastVisitDate lastService spendingPattern');

    res.status(200).json({
      success: true,
      data: customers
    });

  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching customers',
      error: error.message
    });
  }
};

exports.getCustomerDetails = async (req, res) => {
  try {
    const { customerId, businessId } = req.params;

    const customer = await Customer.findOne({ userId: customerId, businessId });
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.status(200).json({
      success: true,
      data: customer
    });

  } catch (error) {
    console.error('Get customer details error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching customer details',
      error: error.message
    });
  }
};

exports.updateCustomerStatus = async (req, res) => {
  try {
    const { customerId, businessId } = req.params;
    const { status } = req.body;

    const customer = await Customer.findOne({ userId: customerId, businessId });
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    customer.status = status;
    await customer.save();

    res.status(200).json({
      success: true,
      message: 'Customer status updated successfully',
      data: customer
    });

  } catch (error) {
    console.error('Update customer status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating customer status',
      error: error.message
    });
  }
};

exports.getCustomerAnalytics = async (req, res) => {
  try {
    const { customerId, businessId } = req.params;

    const customer = await Customer.findOne({ userId: customerId, businessId });
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Calculate analytics
    const analytics = {
      visitFrequency: customer.averageVisitInterval || 0,
      totalVisits: customer.visitHistory?.length || 0,
      totalSpent: customer.spendingPattern?.totalSpent || 0,
      averageSpend: customer.spendingPattern?.averageSpend || 0,
      preferredServices: customer.preferredServices || [],
      ratingHistory: customer.ratings || [],
      averageRating: customer.averageRating || 0,
      statusHistory: customer.status || 'New'
    };

    res.status(200).json({
      success: true,
      data: analytics
    });

  } catch (error) {
    console.error('Get customer analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching customer analytics',
      error: error.message
    });
  }
};

exports.deleteCustomer = async (req, res) => {
  try {
    const { businessId, customerId } = req.params;
    const result = await Customer.deleteOne({ businessId, userId: customerId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    res.status(200).json({ success: true, message: 'Customer deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting customer', error: error.message });
  }
};

// Add or update a visit for a customer
exports.addVisit = async (req, res) => {
  try {
    const { businessId, customerId } = req.params;
    const { date, service, staff, amount } = req.body;

    const customer = await Customer.findOne({ userId: customerId, businessId });
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Create new visit in Visit collection
    const visit = new Visit({
      customerId: customerId,
      businessId: businessId,
      date: date,
      service: service,
      staff: staff,
      amount: amount
    });
    await visit.save();

    // Update customer details
    customer.lastVisitDate = date;
    customer.lastService = service;
    customer.assignedStaff = staff;
    customer.transactionValue = amount;

    // Add visit reference to customer's visitHistory
    if (!customer.visitHistory) {
      customer.visitHistory = [];
    }
    customer.visitHistory.push(visit._id);

    // Update metrics
    customer.calculateAverageVisitInterval();
    customer.updateStatus();

    // Update spending pattern
    if (amount) {
      const totalSpent = customer.visitHistory.reduce((sum, visit) => sum + (visit.amount || 0), 0);
      customer.spendingPattern = {
        averageSpend: totalSpent / customer.visitHistory.length,
        totalSpent,
        lastPayment: amount
      };
    }

    await customer.save();

    res.status(200).json({
      success: true,
      message: 'Visit added and customer updated successfully',
      data: {
        customer: customer,
        visit: visit
      }
    });
  } catch (error) {
    console.error('Add visit error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding visit',
      error: error.message
    });
  }
};

// Add a new service for a customer
exports.addService = async (req, res) => {
  try {
    const { businessId, customerId } = req.params;
    const { serviceName, staff, date, amount } = req.body;

    // Create new service
    const service = new Service({
      customerId,
      businessId,
      serviceName,
      staff,
      date: date || new Date(),
      amount
    });
    await service.save();

    // Update customer's service reference
    const customer = await Customer.findOne({ userId: customerId, businessId });
    if (customer) {
      if (!customer.services) {
        customer.services = [];
      }
      customer.services.push(service._id);
      
      // Update preferred services
      if (!customer.preferredServices.includes(serviceName)) {
        customer.preferredServices.push(serviceName);
      }
      
      await customer.save();
    }

    res.status(200).json({
      success: true,
      message: 'Service added successfully',
      data: service
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding service',
      error: error.message
    });
  }
};

// Add a new rating for a customer
exports.addRating = async (req, res) => {
  try {
    const { businessId, customerId } = req.params;
    const { rating, feedback, date } = req.body;

    // Check if rating already exists for this customer & business
    let existing = await Rating.findOne({ customerId, businessId });
    if (existing) {
      // Update existing rating
      existing.rating = rating;
      existing.feedback = feedback;
      existing.date = date || new Date();
      await existing.save();

      // Update customer's rating reference
      const customer = await Customer.findOne({ userId: customerId, businessId });
      if (customer) {
        if (!customer.ratings.includes(existing._id)) {
          customer.ratings.push(existing._id);
          customer.averageRating = rating;
          customer.lastRating = rating;
          customer.lastExperience = rating >= 4 ? 'Positive' : 'Negative';
          await customer.save();
        }
      }

      return res.status(200).json({
        success: true,
        message: 'Rating updated successfully',
        data: existing
      });
    }

    // If not exists, create new rating
    const newRating = new Rating({ customerId, businessId, rating, feedback, date: date || new Date() });
    await newRating.save();

    // Update customer's rating reference
    const customer = await Customer.findOne({ userId: customerId, businessId });
    if (customer) {
      if (!customer.ratings) {
        customer.ratings = [];
      }
      customer.ratings.push(newRating._id);
      customer.averageRating = rating;
      customer.lastRating = rating;
      customer.lastExperience = rating >= 4 ? 'Positive' : 'Negative';
      await customer.save();
    }

    res.status(200).json({
      success: true,
      message: 'Rating added successfully',
      data: newRating
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding/updating rating',
      error: error.message
    });
  }
};

// Add a new payment for a customer
exports.addPayment = async (req, res) => {
  try {
    const { businessId, customerId } = req.params;
    const { serviceId, amount, paymentMethod, transactionId, paymentDate } = req.body;

    // Create new payment
    const payment = new Payment({
      customerId,
      businessId,
      serviceId,
      amount,
      paymentMethod,
      transactionId,
      paymentDate: paymentDate || new Date()
    });
    await payment.save();

    // Update customer's payment reference and spending pattern
    const customer = await Customer.findOne({ userId: customerId, businessId });
    if (customer) {
      if (!customer.payments) {
        customer.payments = [];
      }
      customer.payments.push(payment._id);

      // Update spending pattern
      const totalSpent = (customer.spendingPattern?.totalSpent || 0) + amount;
      const paymentCount = customer.payments.length;
      customer.spendingPattern = {
        totalSpent,
        averageSpend: totalSpent / paymentCount,
        lastPayment: amount
      };

      await customer.save();
    }

    res.status(200).json({
      success: true,
      message: 'Payment added successfully',
      data: payment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding payment',
      error: error.message
    });
  }
}; 