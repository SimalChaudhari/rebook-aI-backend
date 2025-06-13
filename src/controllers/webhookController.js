const Customer = require('../models/Customer');
const WhatsAppService = require('../services/whatsappService');

exports.handleWebhook = async (req, res) => {
  try {
    // Handle 360dialog webhook
    if (req.body.messages) {
      for (const message of req.body.messages) {
        const { from, text, type } = message;
        
        // Find customer by phone number
        const customer = await Customer.findOne({ phoneNumber: from });
        
        if (customer) {
          // Update last interaction
          customer.lastInteraction = new Date();
          
          // Handle different message types
          if (type === 'text') {
            // Handle text message
            await handleTextMessage(customer, text.body);
          } else if (type === 'image' || type === 'document') {
            // Handle media message
            await handleMediaMessage(customer, type, message);
          }
          
          await customer.save();
        }
      }
      return res.status(200).send('OK');
    }

    // Handle business webhook
    const {
      userId,
      fullName,
      phoneNumber,
      email,
      businessId,
      lastVisitDate,
      assignedStaff,
      lastService,
      transactionValue
    } = req.body;

    // Validate required fields
    if (!userId || !fullName || !phoneNumber || !businessId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Check for unique userId per businessId
    let customer = await Customer.findOne({ userId, businessId });
    if (customer && req.method === 'POST') {
      return res.status(400).json({
        success: false,
        message: 'User ID already exists for this business'
      });
    }

    // Find or create customer
    if (customer) {
      // Update existing customer
      customer.fullName = fullName;
      customer.phoneNumber = phoneNumber;
      customer.email = email;
      customer.lastVisitDate = lastVisitDate;
      customer.assignedStaff = assignedStaff;
      customer.lastService = lastService;
      customer.transactionValue = transactionValue;

      // Add to visit history
      if (lastVisitDate && lastService) {
        customer.visitHistory.push({
          date: lastVisitDate,
          service: lastService,
          staff: assignedStaff,
          amount: transactionValue
        });
      }

      // Update metrics
      customer.calculateAverageVisitInterval();
      customer.updateStatus();

      // Update spending pattern
      if (transactionValue) {
        const totalSpent = customer.visitHistory.reduce((sum, visit) => sum + (visit.amount || 0), 0);
        customer.spendingPattern = {
          averageSpend: totalSpent / customer.visitHistory.length,
          totalSpent,
          lastPayment: transactionValue
        };
      }
    } else {
      // Create new customer
      customer = new Customer({
        userId,
        fullName,
        phoneNumber,
        email,
        businessId,
        lastVisitDate,
        assignedStaff,
        lastService,
        transactionValue,
        status: 'New',
        visitHistory: lastVisitDate ? [{
          date: lastVisitDate,
          service: lastService,
          staff: assignedStaff,
          amount: transactionValue
        }] : []
      });
    }

    await customer.save();

    // Send welcome message for new customers
    if (customer.status === 'New') {
      await sendWelcomeMessage(customer);
    }

    res.status(200).json({
      success: true,
      message: 'Customer data processed successfully',
      customer
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing webhook data',
      error: error.message
    });
  }
};

async function handleTextMessage(customer, messageText) {
  // Add your message handling logic here
  // For example, you could implement a simple chatbot
  let response = '';

  if (messageText.toLowerCase().includes('hello') || messageText.toLowerCase().includes('hi')) {
    response = `Hello ${customer.fullName}! How can I help you today?`;
  } else if (messageText.toLowerCase().includes('appointment')) {
    response = 'Would you like to schedule an appointment? Please let me know your preferred date and time.';
  } else {
    response = 'Thank you for your message. Our team will get back to you shortly.';
  }

  // Send response back to customer
  await WhatsAppService.sendMessage(customer.phoneNumber, response, 'response');
}

async function handleMediaMessage(customer, type, message) {
  const response = `Thank you for sending the ${type}. We have received it and will process it shortly.`;
  await WhatsAppService.sendMessage(customer.phoneNumber, response, 'media_response');
}

async function sendWelcomeMessage(customer) {
  try {
    const message = `Welcome ${customer.fullName}! Thank you for choosing our services. We're excited to have you as a customer.`;
    await WhatsAppService.sendMessage(customer.phoneNumber, message, 'welcome');
  } catch (error) {
    console.error('Error sending welcome message:', error);
  }
} 