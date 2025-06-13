const Customer = require('../models/Customer');
const whatsappService = require('./whatsappService');

class ReviewService {
    async sendReviewRequest(visitId, customerId, businessId) {
        try {
            const customer = await Customer.findById(customerId);
            
            // Send review request
            await whatsappService.sendTemplateMessage(
                customer.phoneNumber,
                'review_request',
                [
                    {
                        type: "text",
                        text: customer.fullName
                    }
                ]
            );

        } catch (error) {
            console.error('Error sending review request:', error);
            throw error;
        }
    }

    async handleReviewResponse(customerId, rating, feedback) {
        try {
            const customer = await Customer.findById(customerId);
            
            // Update customer rating
            customer.ratings.push({
                rating,
                feedback,
                date: new Date()
            });

            // Calculate average rating
            customer.averageRating = customer.ratings.reduce((acc, curr) => acc + curr.rating, 0) / customer.ratings.length;

            await customer.save();

            // Handle based on rating
            if (rating <= 3) {
                // Notify business owner
                await whatsappService.notifyBusinessOwner(customer, rating, feedback);
            } else {
                // Send thank you message with review link
                await whatsappService.sendThankYouMessage(customer);
            }

        } catch (error) {
            console.error('Error handling review response:', error);
            throw error;
        }
    }
}

module.exports = new ReviewService();
