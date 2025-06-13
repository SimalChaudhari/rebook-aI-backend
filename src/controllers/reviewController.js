const Customer = require('../models/Customer');
const whatsappService = require('../services/whatsappService');

// Request review from customer
exports.requestReview = async (req, res) => {
  try {
    const { businessId, customerId, businessName } = req.body;

    const customer = await Customer.findOne({ businessId, userId: customerId });
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Send WhatsApp message requesting review
    const sent = await whatsappService.sendReviewRequest(customer, businessName);

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
    const { businessId, customerId, rating, feedback, businessName, reviewLink } = req.body;

    const customer = await Customer.findOne({ businessId, userId: customerId });
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Update customer's rating
    customer.ratings.push({
      rating,
      feedback,
      date: new Date()
    });

    await customer.save();

    // Handle different rating scenarios
    if (rating >= 4) {
      // Send thank you message with review link for positive ratings
      await whatsappService.sendThankYouMessage(customer, businessName, reviewLink);
    } else if (rating <= 2) {
      // Notify business owner about low ratings
      await whatsappService.notifyBusinessOwner(customer, rating, feedback);
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