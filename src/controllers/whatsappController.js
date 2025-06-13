const whatsappService = require('../services/whatsappService');

// Send template message
exports.sendTemplateMessage = async (req, res) => {
    try {
        const { phoneNumber, templateName, parameters } = req.body;
        
        if (!phoneNumber || !templateName) {
            return res.status(400).json({
                success: false,
                message: 'Phone number and template name are required'
            });
        }

        const result = await whatsappService.sendTemplateMessage(
            phoneNumber, 
            templateName, 
            parameters
        );

        res.json({
            success: true,
            message: 'Template message sent successfully',
            data: result
        });
    } catch (error) {
        console.error('Error sending template message:', error);
        res.status(500).json({
            success: false,
            message: 'Error sending template message',
            error: error.message
        });
    }
};

// Send text message
exports.sendTextMessage = async (req, res) => {
    try {
        const { phoneNumber, message } = req.body;
        
        if (!phoneNumber || !message) {
            return res.status(400).json({
                success: false,
                message: 'Phone number and message are required'
            });
        }

        const result = await whatsappService.sendMessage(
            phoneNumber,
            message,
            'text'
        );

        res.json({
            success: true,
            message: 'Text message sent successfully',
            data: result
        });
    } catch (error) {
        console.error('Error sending text message:', error);
        res.status(500).json({
            success: false,
            message: 'Error sending text message',
            error: error.message
        });
    }
};

// Check number status
exports.checkNumberStatus = async (req, res) => {
    try {
        const { phoneNumber } = req.body;
        
        if (!phoneNumber) {
            return res.status(400).json({
                success: false,
                message: 'Phone number is required'
            });
        }

        const result = await whatsappService.checkNumberStatus(phoneNumber);

        res.json({
            success: true,
            message: 'Number status checked successfully',
            data: result
        });
    } catch (error) {
        console.error('Error checking number status:', error);
        res.status(500).json({
            success: false,
            message: 'Error checking number status',
            error: error.message
        });
    }
};

// Get message status
exports.getMessageStatus = async (req, res) => {
    try {
        const { messageId } = req.params;
        
        if (!messageId) {
            return res.status(400).json({
                success: false,
                message: 'Message ID is required'
            });
        }

        const result = await whatsappService.getMessageStatus(messageId);

        res.json({
            success: true,
            message: 'Message status retrieved successfully',
            data: result
        });
    } catch (error) {
        console.error('Error getting message status:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting message status',
            error: error.message
        });
    }
};