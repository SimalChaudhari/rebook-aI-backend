const Customer = require('../models/Customer');
const whatsappService = require('./whatsappService');

class AutoTaggingService {
    async updateCustomerStatuses(businessId) {
        try {
            const customers = await Customer.find({ businessId });
            
            for (const customer of customers) {
                const daysSinceLastVisit = (new Date() - new Date(customer.lastVisitDate)) / (1000 * 60 * 60 * 24);
                const oldStatus = customer.status;
                
                // Update status
                if (daysSinceLastVisit <= customer.averageVisitInterval) {
                    customer.status = 'Active';
                } else if (daysSinceLastVisit > customer.averageVisitInterval + 5 && daysSinceLastVisit <= 30) {
                    customer.status = 'At Risk';
                } else if (daysSinceLastVisit > 30) {
                    customer.status = 'Lost';
                }

                // Send WhatsApp message if status changed to At Risk or Lost
                if (oldStatus !== customer.status && ['At Risk', 'Lost'].includes(customer.status)) {
                    await this.sendStatusChangeNotification(customer);
                }

                await customer.save();
            }
        } catch (error) {
            console.error('Error updating customer statuses:', error);
            throw error;
        }
    }

    async sendStatusChangeNotification(customer) {
        const message = customer.status === 'At Risk' 
            ? `Hi ${customer.fullName}! We miss you at our salon. Book your next appointment now and get 10% off!`
            : `Hi ${customer.fullName}! It's been a while. We'd love to see you again. Special 20% discount on your next visit!`;

        await whatsappService.sendMessage(customer.phoneNumber, message, 'status_update');
    }
}

module.exports = new AutoTaggingService();
