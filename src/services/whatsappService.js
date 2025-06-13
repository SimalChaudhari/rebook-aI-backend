require('dotenv').config();
const axios = require('axios');
const Business = require('../models/Business');
const Customer = require('../models/Customer');

class WhatsAppService {
  constructor() {
    this.apiKey = process.env.WHATSAPP_API_KEY;
    this.baseURL = process.env.WHATSAPP_BASE_URL;
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'D360-API-KEY': this.apiKey,
        'Content-Type': 'application/json'
      }
    });
    this.messageHistory = new Map(); // Store message history to prevent repetition
  }

  // Format phone number
  formatPhoneNumber(phoneNumber) {
    if (!phoneNumber) return null;
    if (phoneNumber.startsWith('+')) return phoneNumber;
    return phoneNumber.startsWith('91') ? `+${phoneNumber}` : `+91${phoneNumber}`;
  }

  // Check WhatsApp number status
  async checkNumberStatus(phoneNumber) {
    try {
      const formattedNumber = this.formatPhoneNumber(phoneNumber);
      console.log('Checking number status:', formattedNumber);

      const response = await this.client.post('/contacts', {
        blocking: 'wait',
        contacts: [formattedNumber]
      });

      console.log('Number status response:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error) {
      console.error('Error checking number status:', error.response?.data || error.message);
      return null;
    }
  }

  // Send message with rate limiting and history tracking
  async sendMessage(to, message, type) {
    try {
      const formattedNumber = this.formatPhoneNumber(to);
      if (!formattedNumber) {
        throw new Error('Invalid phone number');
      }

      console.log('=== Sending WhatsApp Message ===');
      console.log('To:', formattedNumber);
      console.log('Message:', message);
      console.log('Type:', type);

      const payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: formattedNumber,
        type: 'text',
        text: {
          preview_url: false,
          body: message
        }
      };

      const response = await this.client.post('/messages', payload);
      console.log('Message Response:', JSON.stringify(response.data, null, 2));

      return true;
    } catch (error) {
      console.error('Error sending message:', error.response?.data || error.message);
      return false;
    }
  }

  // Send template message
  async sendTemplateMessage(to, templateName, parameters) {
    try {
      const formattedNumber = this.formatPhoneNumber(to);
      const response = await this.client.post('/messages', {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: formattedNumber,
        type: "template",
        template: {
          name: templateName,
          language: {
            code: "en"
          },
          components: [
            {
              type: "body",
              parameters: parameters
            }
          ]
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error sending template:', error);
      throw error;
    }
  }

  // Send review request
  async sendReviewRequest(customer, businessName) {
    if (!businessName) {
      throw new Error('Business name is required');
    }
    const message = `Hi ${customer.fullName}! How was your experience at ${businessName}? Please rate your visit from 1 to 5 stars. Reply with a number between 1-5.`;
    return this.sendMessage(customer.phoneNumber, message, 'review_request');
  }

  // Send thank you message with review link
  async sendThankYouMessage(customer, businessName, reviewLink) {
    const message = `Thank you for your positive feedback! Would you mind sharing your experience on Google? Here's our review link: ${reviewLink}`;
    return this.sendMessage(customer.phoneNumber, message, 'thank_you');
  }

  // Notify business owner about low rating
  async notifyBusinessOwner(customer, rating, feedback) {
    const message = `⚠️ Low Rating Alert: ${customer.fullName} rated their experience ${rating}/5. Feedback: ${feedback || 'No feedback provided'}`;
    return this.sendMessage(process.env.BUSINESS_OWNER_PHONE, message, 'low_rating_alert');
  }

  // Send re-engagement message to at-risk customers
  async sendReEngagementMessage(customer, businessName, bookingLink, specialOffer) {
    const message = `Hi ${customer.fullName}! We miss you at ${businessName}. Book your next visit now and get ${specialOffer}. Click here to book: ${bookingLink}`;
    return this.sendMessage(customer.phoneNumber, message, 're_engagement');
  }

  // Send lost customer recovery message
  async sendRecoveryMessage(customer, businessName, bookingLink, specialOffer) {
    const message = `Hi ${customer.fullName}! We'd love to have you back at ${businessName}. As a special welcome back offer, you'll get ${specialOffer}. Book now: ${bookingLink}`;
    return this.sendMessage(customer.phoneNumber, message, 'recovery');
  }

  // Get message status
  async getMessageStatus(messageId) {
    try {
      const response = await this.client.get(`/messages/${messageId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting message status:', error);
      throw error;
    }
  }

  // Send welcome template message
  async sendWelcomeTemplate(phoneNumber, customerName) {
    try {
      const response = await this.client.post('/messages', {
        messaging_product: "whatsapp",
        to: phoneNumber,
        type: "template",
        template: {
          name: "welcome_message",
          language: {
            code: "en"
          },
          components: [
            {
              type: "body",
              parameters: [
                {
                  type: "text",
                  text: customerName
                },
                {
                  type: "text",
                  text: "Rebook AI"
                }
              ]
            }
          ]
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error sending welcome template:', error);
      throw error;
    }
  }
}

module.exports = new WhatsAppService(); 