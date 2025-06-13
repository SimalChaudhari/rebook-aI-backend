const Customer = require('../models/Customer');
const Visit = require('../models/Visit');
const Payment = require('../models/Payment');

exports.getDashboardMetrics = async (req, res) => {
  try {
    const { businessId, startDate, endDate } = req.query;
    
    // Get customer statistics
    const customerStats = await Customer.aggregate([
      { $match: { businessId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          averageSpend: { $avg: '$spendingPattern.averageSpend' }
        }
      }
    ]);

    // Calculate retention metrics
    const retentionMetrics = {
      recovered: await Customer.countDocuments({ businessId, status: 'Recovered' }),
      atRisk: await Customer.countDocuments({ businessId, status: 'At Risk' }),
      lost: await Customer.countDocuments({ businessId, status: 'Lost' })
    };

    // Calculate revenue metrics
    const revenueMetrics = await calculateRevenueMetrics(businessId);

    // Get LTV data
    const ltvData = await calculateLTVMetrics(businessId, startDate, endDate);

    res.json({
      success: true,
      data: {
        customerStats,
        retentionMetrics,
        revenueMetrics,
        ltvData
      }
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

// Calculate revenue metrics
async function calculateRevenueMetrics(businessId) {
  // Calculate saved revenue
  const recoveredCustomers = await Customer.find({ 
    businessId, 
    status: 'Recovered' 
  });

  const savedRevenue = recoveredCustomers.reduce((total, customer) => 
    total + (customer.spendingPattern?.averageSpend || 0) * 12, 0);

  // Calculate potential lost revenue
  const lostCustomers = await Customer.find({ 
    businessId, 
    status: 'Lost' 
  });

  const potentialLostRevenue = lostCustomers.reduce((total, customer) => 
    total + (customer.spendingPattern?.averageSpend || 0) * 12, 0);

  return {
    savedRevenue,
    potentialLostRevenue
  };
}

// Calculate LTV metrics
async function calculateLTVMetrics(businessId, startDate, endDate) {
  try {
    // Get all active customers
    const activeCustomers = await Customer.find({ 
      businessId, 
      status: 'Active'
    });

    if (activeCustomers.length === 0) {
      return {
        averageLTV: 0,
        totalCustomers: 0,
        activeCustomers: 0
      };
    }

    // Calculate total LTV
    const totalLTV = activeCustomers.reduce((total, customer) => {
      const avgPayment = customer.spendingPattern?.averageSpend || 0;
      const visitFrequency = customer.averageVisitInterval || 30; // default to monthly
      return total + (avgPayment * (12 / (visitFrequency / 30))); // normalize to monthly
    }, 0);

    // Get total customers count
    const totalCustomers = await Customer.countDocuments({ businessId });

    return {
      averageLTV: totalLTV / activeCustomers.length,
      totalCustomers,
      activeCustomers: activeCustomers.length
    };
  } catch (error) {
    console.error('Error calculating LTV metrics:', error);
    throw error;
  }
}

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