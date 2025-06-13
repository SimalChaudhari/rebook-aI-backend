const Customer = require('../models/Customer');

exports.getCustomers = async (req, res) => {
  try {
    const { businessId, status, search, sortBy, sortOrder } = req.query;
    
    // Build query
    const query = { businessId };
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
      visitFrequency: customer.averageVisitInterval,
      totalVisits: customer.visitHistory.length,
      totalSpent: customer.spendingPattern?.totalSpent || 0,
      averageSpend: customer.spendingPattern?.averageSpend || 0,
      preferredServices: customer.preferredServices,
      ratingHistory: customer.ratings,
      averageRating: customer.averageRating,
      statusHistory: customer.status
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