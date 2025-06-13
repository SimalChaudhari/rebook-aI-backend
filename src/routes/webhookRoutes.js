const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');

// Webhook verification
router.get('/webhook', webhookController.verifyWebhook);

// Handle webhook data
router.post('/webhook', webhookController.handleWebhook);

module.exports = router; 