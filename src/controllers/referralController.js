const Customer = require('../models/Customer');
const Business = require('../models/Business');
const qrService = require('../services/qrService');
const whatsappService = require('../services/whatsappService');
const Referral = require('../models/Referral');

// Generate referral link and QR code
exports.generateReferral = async (req, res) => {
  try {
    const { businessId, customerId } = req.params;

    // Find customer
    const customer = await Customer.findOne({ businessId, userId: customerId });
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Find business
    const business = await Business.findOne({ businessId });
    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    const { referralCode, referralLink, qrCode } = await qrService.createReferralLink(
      businessId,
      customerId,
      business.name // Use business name from database
    );

    res.status(200).json({
      success: true,
      message: 'Referral link generated successfully',
      data: {
        referralCode,
        referralLink,
        qrCode
      }
    });
  } catch (error) {
    console.error('Error generating referral:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating referral',
      error: error.message
    });
  }
};

// Track referral link click
exports.trackReferralClick = async (req, res) => {
  try {
    const { referralCode } = req.params;
    const referral = await qrService.getReferralStats(referralCode);
    if (!referral) {
      return res.status(404).json({ success: false, message: 'Invalid referral code' });
    }
    await qrService.trackReferralClick(referralCode);
    res.status(200).json({
      success: true,
      message: 'Referral click tracked successfully'
    });
  } catch (error) {
    console.error('Error tracking referral click:', error);
    res.status(500).json({
      success: false,
      message: 'Error tracking referral click',
      error: error.message
    });
  }
};

// Track referral conversion
exports.trackReferralConversion = async (req, res) => {
  try {
    const { referralCode } = req.params;
    const { newCustomerId } = req.body;
    const referral = await qrService.getReferralStats(referralCode);
    if (!referral) {
      return res.status(404).json({ success: false, message: 'Invalid referral code' });
    }
    await qrService.trackReferralConversion(referralCode, newCustomerId);
    // Notify referrer about successful conversion
    const referrer = await Customer.findOne({
      businessId: referral.businessId,
      userId: referral.referrerUserId
    });
    if (referrer) {
      await whatsappService.sendMessage(
        referrer.phoneNumber,
        `Great news! Someone used your referral link and became a customer. Thank you for spreading the word about your business!`,
        'referral_conversion'
      );
    }
    res.status(200).json({
      success: true,
      message: 'Referral conversion tracked successfully'
    });
  } catch (error) {
    console.error('Error tracking referral conversion:', error);
    res.status(500).json({
      success: false,
      message: 'Error tracking referral conversion',
      error: error.message
    });
  }
};

// Get referral statistics
exports.getReferralStats = async (req, res) => {
  try {
    const { businessId } = req.params;
    const referrals = await qrService.getBusinessReferrals(businessId);
    res.status(200).json({
      success: true,
      message: 'Referral statistics retrieved successfully',
      data: referrals
    });
  } catch (error) {
    console.error('Error getting referral statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting referral statistics',
      error: error.message
    });
  }
};

// Delete a referral by referralCode
exports.deleteReferral = async (req, res) => {
  try {
    const { referralCode } = req.params;
    const result = await Referral.deleteOne({ referralCode });
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: 'Referral not found' });
    }
    res.status(200).json({ success: true, message: 'Referral deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting referral', error: error.message });
  }
};

// Handle referral link
exports.handleReferralLink = async (req, res) => {
  const { referralCode } = req.params;
  // यहाँ आप referralCode से referral data निकाल सकते हैं, या redirect कर सकते हैं
  // फिलहाल simple message दे रहे हैं
  res.send(`<h2>Referral Link Active!</h2><p>Referral Code: ${referralCode}</p>`);
}; 