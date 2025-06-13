const Customer = require('../models/Customer');

exports.getDashboardMetrics = async (req, res) => {
  try {
    const { businessId, startDate, endDate } = req.query;
    
    // Validate businessId
    if (!businessId) {
      return res.status(400).json({
        success: false,
        message: 'Business ID is required'
      });
    }

    // Set default date range if not provided
    const start = startDate ? new Date(startDate) : new Date(new Date().setMonth(new Date().getMonth() - 1));
    const end = endDate ? new Date(endDate) : new Date();

    // Get all customers for the business
    const customers = await Customer.find({
      businessId,
      createdAt: { $gte: start, $lte: end }
    });

    // Calculate metrics
    const metrics = {
      retention: {
        atRisk: customers.filter(c => c.status === 'At Risk').length,
        lost: customers.filter(c => c.status === 'Lost').length,
        recovered: customers.filter(c => c.status === 'Recovered').length
      },
      revenue: {
        saved: calculateSavedRevenue(customers),
        potentialLoss: calculatePotentialLoss(customers)
      },
      customerStatus: {
        active: customers.filter(c => c.status === 'Active').length,
        atRisk: customers.filter(c => c.status === 'At Risk').length,
        lost: customers.filter(c => c.status === 'Lost').length,
        new: customers.filter(c => c.status === 'New').length,
        recovered: customers.filter(c => c.status === 'Recovered').length
      },
      ltv: calculateLTV(customers),
      ratings: calculateRatingMetrics(customers)
    };

    res.status(200).json({
      success: true,
      data: metrics
    });

  } catch (error) {
    console.error('Dashboard metrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard metrics',
      error: error.message
    });
  }
};

// Helper functions for calculations
function calculateSavedRevenue(customers) {
  const recoveredCustomers = customers.filter(c => c.status === 'Recovered');
  return recoveredCustomers.reduce((total, customer) => {
    const avgPayment = customer.spendingPattern?.averageSpend || 0;
    return total + (avgPayment * 12);
  }, 0);
}

function calculatePotentialLoss(customers) {
  const lostCustomers = customers.filter(c => c.status === 'Lost');
  return lostCustomers.reduce((total, customer) => {
    const avgPayment = customer.spendingPattern?.averageSpend || 0;
    return total + (avgPayment * 12);
  }, 0);
}

function calculateLTV(customers) {
  const activeCustomers = customers.filter(c => c.status === 'Active');
  if (activeCustomers.length === 0) return 0;

  const totalLTV = activeCustomers.reduce((total, customer) => {
    const avgPayment = customer.spendingPattern?.averageSpend || 0;
    const visitFrequency = customer.averageVisitInterval || 30; // default to monthly
    return total + (avgPayment * (12 / (visitFrequency / 30))); // normalize to monthly
  }, 0);

  return totalLTV / activeCustomers.length;
}

function calculateRatingMetrics(customers) {
  const ratings = customers.map(c => c.averageRating).filter(r => r > 0);
  if (ratings.length === 0) return { average: 0, distribution: {} };

  const average = ratings.reduce((a, b) => a + b, 0) / ratings.length;
  const distribution = {
    1: ratings.filter(r => r === 1).length,
    2: ratings.filter(r => r === 2).length,
    3: ratings.filter(r => r === 3).length,
    4: ratings.filter(r => r === 4).length,
    5: ratings.filter(r => r === 5).length
  };

  return { average, distribution };
} 