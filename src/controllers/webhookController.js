const Customer = require('../models/Customer');
const Business = require('../models/Business');
const Visit = require('../models/Visit');
const whatsappService = require('../services/whatsappService');

exports.handleWebhook = async (req, res) => {
    try {
        const {
            userId,
            fullName,
            phoneNumber,
            lastVisitDate,
            assignedStaff,
            lastService,
            transactionValue,
            businessId,
            email = '',
            additionalData = {}
        } = req.body;

        // Validate required fields
        if (!userId || !businessId || !fullName || !phoneNumber) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Find or create customer
        let customer = await Customer.findOne({ userId, businessId });
        
        if (!customer) {
            customer = new Customer({
                userId,
                businessId,
                fullName,
                phoneNumber,
                email,
                status: 'New',
                averageVisitInterval: 0,
                visitHistory: [],
                ratings: [],
                spendingPattern: {
                    totalSpent: 0,
                    averageSpend: 0,
                    lastPayment: 0
                }
            });
        }

        // Add new visit
        const visit = new Visit({
            customerId: customer._id,
            businessId,
            date: lastVisitDate || new Date(),
            service: lastService,
            staff: assignedStaff,
            amount: transactionValue || 0
        });
        await visit.save();

        // Update customer details
        customer.lastVisitDate = lastVisitDate || new Date();
        customer.assignedStaff = assignedStaff;
        customer.lastService = lastService;
        customer.visitHistory.push(visit._id);

        // Update spending pattern
        if (transactionValue) {
            const totalSpent = (customer.spendingPattern?.totalSpent || 0) + transactionValue;
            customer.spendingPattern = {
                totalSpent,
                averageSpend: totalSpent / (customer.visitHistory.length + 1),
                lastPayment: transactionValue
            };
        }

        // Calculate average visit interval
        await customer.calculateAverageVisitInterval();

        // Update customer status
        const daysSinceLastVisit = (new Date() - new Date(customer.lastVisitDate)) / (1000 * 60 * 60 * 24);
        if (daysSinceLastVisit <= customer.averageVisitInterval) {
            customer.status = 'Active';
        } else if (daysSinceLastVisit > customer.averageVisitInterval + 5) {
            customer.status = 'At Risk';
        }

        await customer.save();

        // Send welcome message for new customers
        if (customer.visitHistory.length === 1) {
            await whatsappService.sendTemplateMessage(
                customer.phoneNumber,
                'welcome_message',
                [
                    {
                        type: "text",
                        text: customer.fullName
                    },
                    {
                        type: "text",
                        text: "Rebook AI"
                    }
                ]
            );
        }

        res.status(200).json({
            success: true,
            message: 'Webhook processed successfully',
            data: { customerId: customer._id, visitId: visit._id }
        });

    } catch (error) {
        console.error('Webhook Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing webhook',
            error: error.message
        });
    }
};

// Verify webhook
exports.verifyWebhook = async (req, res) => {
    try {
        const { token } = req.query;
        
        if (token === process.env.WEBHOOK_VERIFY_TOKEN) {
            res.status(200).send(req.query['hub.challenge']);
        } else {
            res.status(403).json({
                success: false,
                message: 'Invalid verification token'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error verifying webhook',
            error: error.message
        });
    }
}; 