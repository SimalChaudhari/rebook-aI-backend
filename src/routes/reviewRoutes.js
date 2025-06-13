const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');

// Request review from customer
router.post('/request', reviewController.requestReview);

// Submit customer review
router.post('/submit', reviewController.submitReview);

module.exports = router; 