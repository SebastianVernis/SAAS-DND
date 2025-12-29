import { logger } from '../utils/logger.js';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';
import 'dotenv/config';

// Connection
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Optimized connection pool configuration
// Based on expected load and best practices
const poolConfig = {
  // Maximum number of connections in the pool
  // Formula: (core_count * 2) + effective_spindle_count
  // For typical web server: 10-20 connections is optimal
  max: parseInt(process.env.DB_POOL_MAX) || 20,

  // Minimum number of idle connections to maintain
  // Keeps connections warm for faster response times
  // Set to 2-5 for production to handle burst traffic
  idle_timeout: parseInt(process.env.DB_IDLE_TIMEOUT) || 30,

  // Maximum time (seconds) to wait for a connection from the pool
  // If all connections are busy, wait this long before timing out
  connect_timeout: parseInt(process.env.DB_CONNECT_TIMEOUT) || 10,

  // Maximum lifetime of a connection (seconds)
  // Prevents stale connections and helps with load balancing
  max_lifetime: parseInt(process.env.DB_MAX_LIFETIME) || 3600, // 1 hour

  // Enable connection pooling debug logs (development only)
  debug: process.env.NODE_ENV === 'development' && process.env.DB_DEBUG === 'true',

  // Connection retry configuration
  connection: {
    // Application name for PostgreSQL logs
    application_name: 'dragndrop-api',
  },

  // Transform column names (optional - for consistency)
  transform: {
    undefined: null, // Transform undefined to null
  },

  // Error handling
  onnotice: () => {}, // Suppress PostgreSQL notices in production
};

// Create postgres client with optimized pool
export const sql = postgres(connectionString, poolConfig);

// Create drizzle instance
export const db = drizzle(sql, { schema });

// Connection pool statistics
let connectionStats = {
  totalQueries: 0,
  activeConnections: 0,
  idleConnections: 0,
  waitingClients: 0,
  lastCheck: new Date(),
};

/**
 * Test database connection
 * @returns {Promise<boolean>} Connection status
 */
export async function testConnection() {
  try {
    const startTime = performance.now();
    await sql`SELECT 1`;
    const duration = performance.now() - startTime;
    
    logger.info(`✅ Database connected successfully (${duration.toFixed(2)}ms)`);
    return true;
  } catch (error) {
    logger.error('❌ Database connection failed:', error.message);
    return false;
  }
}

/**
 * Get connection pool statistics
 * @returns {Object} Pool statistics
 */
export function getPoolStats() {
  // Note: postgres-js doesn't expose pool stats directly
  // This is a placeholder for monitoring integration
  return {
    ...connectionStats,
    maxConnections: poolConfig.max,
    idleTimeout: poolConfig.idle_timeout,
    connectTimeout: poolConfig.connect_timeout,
  };
}

/**
 * Log connection pool statistics
 */
export function logPoolStats() {
  const stats = getPoolStats();
  logger.info('📊 Database Pool Stats:', {
    maxConnections: stats.maxConnections,
    idleTimeout: `${stats.idleTimeout}s`,
    connectTimeout: `${stats.connectTimeout}s`,
  });
}

/**
 * Close all database connections gracefully
 * @returns {Promise<void>}
 */
export async function closeConnections() {
  try {
    await sql.end({ timeout: 5 });
    logger.info('👋 Database connections closed');
  } catch (error) {
    logger.error('❌ Error closing database connections:', error.message);
  }
}

// Log pool configuration on startup
if (process.env.NODE_ENV !== 'test') {
  logger.info('🔧 Database Pool Configuration:', {
    max: poolConfig.max,
    idleTimeout: `${poolConfig.idle_timeout}s`,
    connectTimeout: `${poolConfig.connect_timeout}s`,
    maxLifetime: `${poolConfig.max_lifetime}s`,
  });
}
