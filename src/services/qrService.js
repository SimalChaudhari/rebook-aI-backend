const QRCode = require('qrcode');
const crypto = require('crypto');
const Referral = require('../models/Referral');

class QRService {
  constructor() {
    this.referralLinks = new Map(); // Store referral links and their metadata
  }

  // Generate unique referral code
  generateReferralCode(businessId, customerId) {
    const timestamp = Date.now();
    const random = crypto.randomBytes(4).toString('hex');
    return `${businessId}-${customerId}-${timestamp}-${random}`;
  }

  // Generate QR code for a referral link
  async generateQRCode(referralLink) {
    try {
      const qrCodeDataURL = await QRCode.toDataURL(referralLink, {
        errorCorrectionLevel: 'H',
        margin: 1,
        width: 300
      });
      return qrCodeDataURL;
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw error;
    }
  }

  // Create new referral link and save to DB, or return existing if already present
  async createReferralLink(businessId, customerId, businessName) {
    // Check if referral already exists for this user and business
    let referral = await Referral.findOne({ businessId, referrerUserId: customerId });
    if (referral) {
      // Already exists, return existing data
      const referralLink = `${process.env.BASE_URL}/refer/${referral.referralCode}`;
      const qrCode = await this.generateQRCode(referralLink);
      return {
        referralCode: referral.referralCode,
        referralLink,
        qrCode
      };
    }

    // Else, create new referral
    const referralCode = this.generateReferralCode(businessId, customerId);
    const referralLink = `${process.env.BASE_URL}/refer/${referralCode}`;

    referral = await Referral.create({
      referralCode,
      businessId,
      referrerUserId: customerId
    });

    const qrCode = await this.generateQRCode(referralLink);

    return {
      referralCode,
      referralLink,
      qrCode
    };
  }

  // Track referral link click
  async trackReferralClick(referralCode) {
    const referral = await Referral.findOne({ referralCode });
    if (referral) {
      referral.clicks += 1;
      referral.lastClickedAt = new Date();
      await referral.save();
    }
  }

  // Track referral conversion
  async trackReferralConversion(referralCode, newCustomerId) {
    const referral = await Referral.findOne({ referralCode });
    if (referral) {
      referral.conversions += 1;
      referral.lastConvertedAt = new Date();
      if (!referral.convertedUserIds.includes(newCustomerId)) {
        referral.convertedUserIds.push(newCustomerId);
      }
      await referral.save();
    }
  }

  // Get referral statistics
  async getReferralStats(referralCode) {
    return Referral.findOne({ referralCode });
  }

  // Get all referral links for a business
  async getBusinessReferrals(businessId) {
    return Referral.find({ businessId });
  }
}

module.exports = new QRService(); 