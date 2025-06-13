const QRCode = require('qrcode');
const crypto = require('crypto');
const Referral = require('../models/Referral');
const { v4: uuidv4 } = require('uuid');
const Customer = require('../models/Customer');
const Visit = require('../models/Visit');
const Rating = require('../models/Rating');
const Business = require('../models/Business');

// Generate QR code
const generateQRCode = async (data) => {
  try {
    return await QRCode.toDataURL(data);
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
};

// Create referral link and QR code
const createReferralLink = async (businessId, customerId, businessName) => {
  try {
    // Generate unique referral code
    const referralCode = `REF${Date.now().toString(36).toUpperCase()}`;
    
    // Create referral link
    const referralLink = `${process.env.FRONTEND_URL}/refer/${referralCode}`;
    
    // Generate QR code
    const qrCode = await generateQRCode(referralLink);

    // Save referral in database
    const referral = new Referral({
      referralCode,
      businessId,
      referrerUserId: customerId,
      createdAt: new Date()
    });
    await referral.save();

    return {
      referralCode,
      referralLink,
      qrCode
    };
  } catch (error) {
    console.error('Error creating referral link:', error);
    throw error;
  }
};

// Get referral statistics
const getReferralStats = async (referralCode) => {
  try {
    const referral = await Referral.findOne({ referralCode });
    return referral;
  } catch (error) {
    console.error('Error getting referral stats:', error);
    throw error;
  }
};

// Track referral click
const trackReferralClick = async (referralCode) => {
  try {
    const referral = await Referral.findOne({ referralCode });
    if (!referral) {
      throw new Error('Referral not found');
    }

    referral.clicks += 1;
    referral.lastClickedAt = new Date();
    await referral.save();

    return referral;
  } catch (error) {
    console.error('Error tracking referral click:', error);
    throw error;
  }
};

// Track referral conversion
const trackReferralConversion = async (referralCode, newCustomerId) => {
  try {
    const referral = await Referral.findOne({ referralCode });
    if (!referral) {
      throw new Error('Referral not found');
    }

    referral.conversions += 1;
    referral.convertedUserIds.push(newCustomerId);
    referral.lastConvertedAt = new Date();
    await referral.save();

    return referral;
  } catch (error) {
    console.error('Error tracking referral conversion:', error);
    throw error;
  }
};

// Get business referrals
const getBusinessReferrals = async (businessId) => {
  try {
    const referrals = await Referral.find({ businessId })
      .sort({ createdAt: -1 });

    const stats = {
      totalReferrals: referrals.length,
      totalClicks: referrals.reduce((sum, ref) => sum + ref.clicks, 0),
      totalConversions: referrals.reduce((sum, ref) => sum + ref.conversions, 0),
      conversionRate: referrals.length > 0 
        ? `${((referrals.reduce((sum, ref) => sum + ref.conversions, 0) / 
          referrals.reduce((sum, ref) => sum + ref.clicks, 0)) * 100).toFixed(1)}%`
        : '0%',
      referrals
    };

    return stats;
  } catch (error) {
    console.error('Error getting business referrals:', error);
    throw error;
  }
};

class LTVService {
    async calculateCustomerLTV(customerId) {
        try {
            const customer = await Customer.findById(customerId)
                .populate('visitHistory');
            
            // Calculate total spent
            const totalSpent = customer.visitHistory.reduce((sum, visit) => 
                sum + (visit.amount || 0), 0);
            
            // Calculate customer lifetime (in months)
            const firstVisit = new Date(customer.visitHistory[0]?.date);
            const lastVisit = new Date(customer.lastVisitDate);
            const lifetimeMonths = (lastVisit - firstVisit) / (1000 * 60 * 60 * 24 * 30);
            
            // Calculate monthly value
            const monthlyValue = totalSpent / (lifetimeMonths || 1);

            return {
                totalSpent,
                lifetimeMonths,
                monthlyValue,
                predictedAnnualValue: monthlyValue * 12
            };
        } catch (error) {
            console.error('Error calculating LTV:', error);
            throw error;
        }
    }

    async getBusinessLTVMetrics(businessId) {
        try {
            const customers = await Customer.find({ businessId });
            const ltvData = [];
            
            for (const customer of customers) {
                const ltv = await this.calculateCustomerLTV(customer._id);
                ltvData.push({
                    customerId: customer._id,
                    ...ltv
                });
            }

            // Calculate averages
            const averageLTV = ltvData.reduce((sum, data) => 
                sum + data.predictedAnnualValue, 0) / ltvData.length;
            
            return {
                averageLTV,
                customerLTVs: ltvData
            };
        } catch (error) {
            console.error('Error getting LTV metrics:', error);
            throw error;
        }
    }
}

class RatingAnalyticsService {
    async getBusinessRatingMetrics(businessId, startDate, endDate) {
        try {
            const ratings = await Rating.find({
                businessId,
                date: {
                    $gte: startDate,
                    $lte: endDate
                }
            });

            // Calculate average rating over time
            const monthlyRatings = {};
            ratings.forEach(rating => {
                const month = rating.date.toISOString().slice(0, 7); // YYYY-MM
                if (!monthlyRatings[month]) {
                    monthlyRatings[month] = {
                        sum: 0,
                        count: 0
                    };
                }
                monthlyRatings[month].sum += rating.rating;
                monthlyRatings[month].count += 1;
            });

            // Format for graph
            const ratingTrend = Object.keys(monthlyRatings).map(month => ({
                month,
                averageRating: monthlyRatings[month].sum / monthlyRatings[month].count
            }));

            // Calculate distribution
            const ratingDistribution = {
                1: 0, 2: 0, 3: 0, 4: 0, 5: 0
            };
            ratings.forEach(rating => {
                ratingDistribution[rating.rating]++;
            });

            return {
                ratingTrend,
                ratingDistribution,
                overallAverage: ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
            };
        } catch (error) {
            console.error('Error calculating rating metrics:', error);
            throw error;
        }
    }
}

class SegmentationService {
    async segmentCustomers(businessId) {
        try {
            const customers = await Customer.find({ businessId });
            
            const segments = {
                vip: [],
                regular: [],
                occasional: [],
                atRisk: [],
                lost: []
            };

            customers.forEach(customer => {
                // VIP: High spending, frequent visits
                if (customer.spendingPattern.averageSpend > 1000 && 
                    customer.visitHistory.length >= 5) {
                    segments.vip.push(customer._id);
                }
                // Regular: Consistent visits
                else if (customer.status === 'Active') {
                    segments.regular.push(customer._id);
                }
                // Occasional: Irregular visits
                else if (customer.visitHistory.length < 3) {
                    segments.occasional.push(customer._id);
                }
                // At Risk
                else if (customer.status === 'At Risk') {
                    segments.atRisk.push(customer._id);
                }
                // Lost
                else if (customer.status === 'Lost') {
                    segments.lost.push(customer._id);
                }
            });

            return segments;
        } catch (error) {
            console.error('Error segmenting customers:', error);
            throw error;
        }
    }
}

module.exports = {
  createReferralLink,
  getReferralStats,
  trackReferralClick,
  trackReferralConversion,
  getBusinessReferrals,
  LTVService,
  RatingAnalyticsService,
  SegmentationService
}; 