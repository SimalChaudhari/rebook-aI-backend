const express = require('express');
const router = express.Router();
const businessController = require('../controllers/businessController');

router.post('/create', businessController.createBusiness);
router.get('/all', businessController.getAllBusinesses);
router.get('/:businessId', businessController.getBusinessById);
router.delete('/:businessId', businessController.deleteBusiness);

module.exports = router; 