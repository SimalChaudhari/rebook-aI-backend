const Business = require('../models/Business');

exports.createBusiness = async (req, res) => {
  try {
    const { businessId, name, ownerName, phoneNumber, email, address, whatsappNumber } = req.body;
    // Check if businessId already exists
    const existing = await Business.findOne({ businessId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Business ID already exists' });
    }
    const business = new Business({ businessId, name, ownerName, phoneNumber, email, address, whatsappNumber });
    await business.save();
    res.status(201).json({ success: true, message: 'Business created', data: business });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating business', error: error.message });
  }
};

// Get all businesses
exports.getAllBusinesses = async (req, res) => {
  try {
    const businesses = await Business.find();
    res.status(200).json({ success: true, data: businesses });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching businesses', error: error.message });
  }
};

// Get single business by businessId
exports.getBusinessById = async (req, res) => {
  try {
    const { businessId } = req.params;
    const business = await Business.findOne({ businessId });
    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }
    res.status(200).json({ success: true, data: business });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching business', error: error.message });
  }
};

exports.deleteBusiness = async (req, res) => {
  try {
    const { businessId } = req.params;
    const result = await Business.deleteOne({ businessId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }
    res.status(200).json({ success: true, message: 'Business deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting business', error: error.message });
  }
}; 