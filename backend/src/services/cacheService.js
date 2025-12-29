import { createClient } from 'redis';
import { logger } from '../utils/logger.js';

// Redis client instance
let redisClient = null;
let isRedisEnabled = false;

/**
 * Initialize Redis client
 */
export async function initializeRedis() {
  // Check if Redis is enabled
  if (process.env.REDIS_ENABLED === 'false' || process.env.NODE_ENV === 'test') {
    logger.info('⚠️  Redis caching disabled');
    isRedisEnabled = false;
    return false;
  }

  try {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    
    redisClient = createClient({
      url: redisUrl,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            logger.error('❌ Redis: Max reconnection attempts reached');
            return new Error('Redis reconnection failed');
          }
          return Math.min(retries * 100, 3000);
        },
      },
    });

    // Error handling
    redisClient.on('error', (err) => {
      logger.error('❌ Redis Client Error:', err.message);
      isRedisEnabled = false;
    });

    redisClient.on('connect', () => {
      logger.info('🔄 Redis: Connecting...');
    });

    redisClient.on('ready', () => {
      logger.info('✅ Redis: Connected and ready');
      isRedisEnabled = true;
    });

    redisClient.on('reconnecting', () => {
      logger.warn('⚠️  Redis: Reconnecting...');
    });

    // Connect to Redis
    await redisClient.connect();
    
    return true;
  } catch (error) {
    logger.error('❌ Redis initialization failed:', error.message);
    logger.warn('⚠️  Continuing without Redis caching');
    isRedisEnabled = false;
    return false;
  }
}

/**
 * Close Redis connection
 */
export async function closeRedis() {
  if (redisClient && redisClient.isOpen) {
    await redisClient.quit();
    logger.info('👋 Redis connection closed');
  }
}

/**
 * Get value from cache
 * @param {string} key - Cache key
 * @returns {Promise<any|null>} - Cached value or null
 */
export async function getCache(key) {
  if (!isRedisEnabled || !redisClient) {
    return null;
  }

  try {
    const value = await redisClient.get(key);
    if (value) {
      logger.debug(`✅ Cache HIT: ${key}`);
      return JSON.parse(value);
    }
    logger.debug(`❌ Cache MISS: ${key}`);
    return null;
  } catch (error) {
    logger.error(`❌ Cache GET error for key ${key}:`, error.message);
    return null;
  }
}

/**
 * Set value in cache
 * @param {string} key - Cache key
 * @param {any} value - Value to cache
 * @param {number} ttl - Time to live in seconds (default: 300 = 5 minutes)
 * @returns {Promise<boolean>} - Success status
 */
export async function setCache(key, value, ttl = 300) {
  if (!isRedisEnabled || !redisClient) {
    return false;
  }

  try {
    await redisClient.setEx(key, ttl, JSON.stringify(value));
    logger.debug(`✅ Cache SET: ${key} (TTL: ${ttl}s)`);
    return true;
  } catch (error) {
    logger.error(`❌ Cache SET error for key ${key}:`, error.message);
    return false;
  }
}

/**
 * Delete value from cache
 * @param {string} key - Cache key
 * @returns {Promise<boolean>} - Success status
 */
export async function deleteCache(key) {
  if (!isRedisEnabled || !redisClient) {
    return false;
  }

  try {
    await redisClient.del(key);
    logger.debug(`✅ Cache DELETE: ${key}`);
    return true;
  } catch (error) {
    logger.error(`❌ Cache DELETE error for key ${key}:`, error.message);
    return false;
  }
}

/**
 * Delete multiple keys matching a pattern
 * @param {string} pattern - Key pattern (e.g., 'user:123:*')
 * @returns {Promise<number>} - Number of keys deleted
 */
export async function deleteCachePattern(pattern) {
  if (!isRedisEnabled || !redisClient) {
    return 0;
  }

  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length === 0) {
      return 0;
    }
    
    await redisClient.del(keys);
    logger.debug(`✅ Cache DELETE pattern: ${pattern} (${keys.length} keys)`);
    return keys.length;
  } catch (error) {
    logger.error(`❌ Cache DELETE pattern error for ${pattern}:`, error.message);
    return 0;
  }
}

/**
 * Cache wrapper function - get from cache or execute function and cache result
 * @param {string} key - Cache key
 * @param {Function} fetchFn - Function to execute if cache miss
 * @param {number} ttl - Time to live in seconds
 * @returns {Promise<any>} - Cached or fresh data
 */
export async function cacheWrapper(key, fetchFn, ttl = 300) {
  // Try to get from cache
  const cached = await getCache(key);
  if (cached !== null) {
    return cached;
  }

  // Cache miss - fetch fresh data
  const data = await fetchFn();
  
  // Cache the result
  await setCache(key, data, ttl);
  
  return data;
}

/**
 * Generate cache key for user data
 * @param {string} userId - User ID
 * @param {string} suffix - Optional suffix
 * @returns {string} - Cache key
 */
export function userCacheKey(userId, suffix = '') {
  return suffix ? `user:${userId}:${suffix}` : `user:${userId}`;
}

/**
 * Generate cache key for organization data
 * @param {string} orgId - Organization ID
 * @param {string} suffix - Optional suffix
 * @returns {string} - Cache key
 */
export function orgCacheKey(orgId, suffix = '') {
  return suffix ? `org:${orgId}:${suffix}` : `org:${orgId}`;
}

/**
 * Generate cache key for project data
 * @param {string} projectId - Project ID
 * @param {string} suffix - Optional suffix
 * @returns {string} - Cache key
 */
export function projectCacheKey(projectId, suffix = '') {
  return suffix ? `project:${projectId}:${suffix}` : `project:${projectId}`;
}

/**
 * Invalidate all caches for a user
 * @param {string} userId - User ID
 * @returns {Promise<number>} - Number of keys deleted
 */
export async function invalidateUserCache(userId) {
  return await deleteCachePattern(`user:${userId}:*`);
}

/**
 * Invalidate all caches for an organization
 * @param {string} orgId - Organization ID
 * @returns {Promise<number>} - Number of keys deleted
 */
export async function invalidateOrgCache(orgId) {
  return await deleteCachePattern(`org:${orgId}:*`);
}

/**
 * Invalidate all caches for a project
 * @param {string} projectId - Project ID
 * @returns {Promise<number>} - Number of keys deleted
 */
export async function invalidateProjectCache(projectId) {
  return await deleteCachePattern(`project:${projectId}:*`);
}

/**
 * Check if Redis is available
 * @returns {boolean} - Redis availability status
 */
export function isRedisAvailable() {
  return isRedisEnabled && redisClient && redisClient.isOpen;
}

export default {
  initializeRedis,
  closeRedis,
  getCache,
  setCache,
  deleteCache,
  deleteCachePattern,
  cacheWrapper,
  userCacheKey,
  orgCacheKey,
  projectCacheKey,
  invalidateUserCache,
  invalidateOrgCache,
  invalidateProjectCache,
  isRedisAvailable,
};
