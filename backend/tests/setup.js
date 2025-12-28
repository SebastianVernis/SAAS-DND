const { config } = require('dotenv');
const path = require('path');

// Load test environment variables
config({ path: path.join(__dirname, '../.env.test') });

// Mock nodemailer for all tests
jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    sendMail: jest.fn((mailOptions, callback) => {
      const info = {
        messageId: 'test-message-id',
        accepted: [mailOptions.to],
        response: '250 OK',
      };
      if (callback) {
        callback(null, info);
      }
      return Promise.resolve(info);
    }),
    verify: jest.fn(() => Promise.resolve(true)),
  })),
}));

// Suppress console logs during tests (except errors)
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: console.error, // Keep errors visible
};

// Global test timeout
jest.setTimeout(30000);
