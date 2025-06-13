const express = require('express');
const router = express.Router();
const whatsappService = require('../services/whatsappService');

// Test WhatsApp integration
router.post('/test', async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    
    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }

    const success = await whatsappService.testWhatsApp(phoneNumber);

    if (success) {
      res.json({
        success: true,
        message: 'Test message sent successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send test message'
      });
    }
  } catch (error) {
    console.error('Error in test route:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending test message',
      error: error.message
    });
  }
});

module.exports = router; 