const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');

// Webhook endpoint for receiving customer data
router.post('/customer', webhookController.handleWebhook);

module.exports = router; 