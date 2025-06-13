const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// Get dashboard metrics
router.get('/metrics', dashboardController.getDashboardMetrics);

module.exports = router; 