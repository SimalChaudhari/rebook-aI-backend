const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');

// Get all customers with filters
router.get('/', customerController.getCustomers);

// Get customer details
router.get('/:businessId/:customerId', customerController.getCustomerDetails);

// Update customer status
router.patch('/:businessId/:customerId/status', customerController.updateCustomerStatus);

// Get customer analytics
router.get('/:businessId/:customerId/analytics', customerController.getCustomerAnalytics);

// Delete a customer
router.delete('/:businessId/:customerId', customerController.deleteCustomer);

module.exports = router; 