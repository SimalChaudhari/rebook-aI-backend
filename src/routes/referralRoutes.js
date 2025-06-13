const express = require('express');
const router = express.Router();
const referralController = require('../controllers/referralController');
const Payment = require('../models/Payment');

// Generate referral link and QR code
router.post('/:businessId/:customerId/generate', referralController.generateReferral);

// Track referral link click
router.post('/track/:referralCode/click', referralController.trackReferralClick);

// Track referral conversion
router.post('/track/:referralCode/conversion', referralController.trackReferralConversion);

// Get referral statistics
router.get('/stats/:businessId', referralController.getReferralStats);

// Delete a referral
router.delete('/:referralCode', referralController.deleteReferral);

// Handle referral link
router.get('/refer/:referralCode', referralController.handleReferralLink);

module.exports = router; 