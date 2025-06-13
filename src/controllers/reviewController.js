const Customer = require('../models/Customer');
const whatsappService = require('../services/whatsappService');
const Business = require('../models/Business');
const Rating = require('../models/Rating');

// Request review from customer
exports.requestReview = async (req, res) => {
  try {
    const { businessId, customerId } = req.body;

    const customer = await Customer.findOne({ businessId, userId: customerId });
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    const business = await Business.findOne({ businessId });
    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    // Send WhatsApp message requesting review
    const sent = await whatsappService.sendReviewRequest(customer, business.name);

    if (!sent) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send review request'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Review request sent successfully'
    });
  } catch (error) {
    console.error('Error requesting review:', error);
    res.status(500).json({
      success: false,
      message: 'Error requesting review',
      error: error.message
    });
  }
};

// Submit review
exports.submitReview = async (req, res) => {
  try {
    const { businessId, customerId, rating, reviewText } = req.body;

    const customer = await Customer.findOne({ businessId, userId: customerId });
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // नया Rating create करें
    const newRating = new Rating({
      businessId,
      customerId,
      rating,
      feedback: reviewText,
      date: new Date()
    });
    await newRating.save();

    // Customer के ratings array में ObjectId push करें
    if (!customer.ratings) customer.ratings = [];
    customer.ratings.push(newRating._id);
    customer.averageRating = rating;
    customer.lastRating = rating;
    customer.lastExperience = rating >= 4 ? 'Positive' : 'Negative';
    await customer.save();
    const reviewLink = `${process.env.FRONTEND_URL}/review/${businessId}/${customerId}`;

    // Handle different rating scenarios
    if (rating >= 4) {
      const business = await Business.findOne({ businessId });
      if (business) {
        await whatsappService.sendThankYouMessage(customer, business.name, reviewLink);
      }
    } else if (rating <= 2) {
      const business = await Business.findOne({ businessId });
      if (business) {
        await whatsappService.notifyBusinessOwner(customer, rating, reviewText);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Review submitted successfully'
    });
  } catch (error) {
    console.error('Error submitting review:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting review',
      error: error.message
    });
  }
}; 