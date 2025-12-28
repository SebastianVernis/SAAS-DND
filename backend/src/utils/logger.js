/* eslint-disable no-console */
/**
 * Simple logger utility that respects NODE_ENV
 * In production, only errors are logged
 * In development/test, all levels are logged
 */

const isDevelopment = process.env.NODE_ENV === 'development';
const isTest = process.env.NODE_ENV === 'test';

export const logger = {
  info: (...args) => {
    if (isDevelopment) {
      console.log('[INFO]', ...args);
    }
  },

  warn: (...args) => {
    if (isDevelopment) {
      console.warn('[WARN]', ...args);
    }
  },

  error: (...args) => {
    // Always log errors, even in production
    console.error('[ERROR]', ...args);
  },

  debug: (...args) => {
    if (isDevelopment && !isTest) {
      console.log('[DEBUG]', ...args);
    }
  },

  success: (...args) => {
    if (isDevelopment) {
      console.log('[SUCCESS]', ...args);
    }
  },
};

export default logger;
