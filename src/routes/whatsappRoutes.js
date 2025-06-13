const express = require('express');
const router = express.Router();
const whatsappController = require('../controllers/whatsappController');

// Template message route
router.post('/send-template', whatsappController.sendTemplateMessage);

// Text message route
router.post('/send-text', whatsappController.sendTextMessage);

// Check number status
router.post('/check-number', whatsappController.checkNumberStatus);

// Get message status
router.get('/message-status/:messageId', whatsappController.getMessageStatus);

module.exports = router; 