const cron = require('node-cron');
const autoTaggingService = require('../services/autoTaggingService');
const Business = require('../models/Business');

// Run status updates daily at midnight
cron.schedule('0 0 * * *', async () => {
    try {
        const businesses = await Business.find();
        for (const business of businesses) {
            await autoTaggingService.updateCustomerStatuses(business._id);
        }
    } catch (error) {
        console.error('Cron job error:', error);
    }
});
