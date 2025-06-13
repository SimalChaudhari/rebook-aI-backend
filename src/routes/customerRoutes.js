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

// Add or update a visit for a customer
router.post('/:businessId/:customerId/add-visit', customerController.addVisit);

// Add a new service for a customer
router.post('/:businessId/:customerId/add-service', customerController.addService);

// Add a new rating for a customer
router.post('/:businessId/:customerId/add-rating', customerController.addRating);

// Add a new payment for a customer
router.post('/:businessId/:customerId/add-payment', customerController.addPayment);

module.exports = router; 