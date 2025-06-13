# Smart Rebook AI Backend

A Node.js and MongoDB backend system for managing customer relationships and automated outreach.

## Features

- Webhook integration for customer data
- Automated customer status tracking
- WhatsApp integration for customer communication
- Customer review collection
- Performance dashboard metrics
- Customer management system

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Twilio Account (for WhatsApp integration)

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd rebook-ai-backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/rebook-ai
JWT_SECRET=your_jwt_secret_key
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
NODE_ENV=development
```

4. Start the development server:
```bash
npm run dev
```

## API Endpoints

### Webhook Endpoint
- `POST /api/webhook/customer`
  - Receives customer data from external systems
  - Required fields: userId, fullName, phoneNumber, businessId
  - Optional fields: email, lastVisitDate, assignedStaff, lastService, transactionValue

## Customer Status Logic

- **Active**: Visited less than average interval + 5 days
- **At Risk**: Current date is beyond average interval + 5 days
- **Lost**: Extended period beyond At Risk threshold
- **Recovered**: Previously At Risk or Lost, now booked again
- **New**: First-time customers

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License. 