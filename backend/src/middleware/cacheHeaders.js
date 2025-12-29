/**
 * HTTP Cache Headers Middleware
 * 
 * Adds appropriate Cache-Control headers to API responses
 * to enable browser and CDN caching for improved performance.
 */

/**
 * No caching - for dynamic, user-specific data
 * Use for: User profiles, authenticated data, real-time data
 */
export function noCache(req, res, next) {
  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  });
  next();
}

/**
 * Short cache - for frequently changing data
 * Use for: Project lists, team members, recent activity
 * @param {number} seconds - Cache duration in seconds (default: 60)
 */
export function shortCache(seconds = 60) {
  return (req, res, next) => {
    res.set({
      'Cache-Control': `private, max-age=${seconds}`,
      'Vary': 'Authorization',
    });
    next();
  };
}

/**
 * Medium cache - for moderately changing data
 * Use for: Individual projects, organization data
 * @param {number} seconds - Cache duration in seconds (default: 300 = 5 minutes)
 */
export function mediumCache(seconds = 300) {
  return (req, res, next) => {
    res.set({
      'Cache-Control': `private, max-age=${seconds}`,
      'Vary': 'Authorization',
    });
    next();
  };
}

/**
 * Long cache - for rarely changing data
 * Use for: Static configuration, templates, public data
 * @param {number} seconds - Cache duration in seconds (default: 3600 = 1 hour)
 */
export function longCache(seconds = 3600) {
  return (req, res, next) => {
    res.set({
      'Cache-Control': `public, max-age=${seconds}`,
    });
    next();
  };
}

/**
 * Conditional cache - with ETag support
 * Use for: Resources that should be validated before use
 * @param {number} seconds - Cache duration in seconds (default: 300)
 */
export function conditionalCache(seconds = 300) {
  return (req, res, next) => {
    res.set({
      'Cache-Control': `private, max-age=${seconds}, must-revalidate`,
      'Vary': 'Authorization',
    });
    next();
  };
}

/**
 * Immutable cache - for content that never changes
 * Use for: Versioned assets, hashed filenames
 * @param {number} seconds - Cache duration in seconds (default: 31536000 = 1 year)
 */
export function immutableCache(seconds = 31536000) {
  return (req, res, next) => {
    res.set({
      'Cache-Control': `public, max-age=${seconds}, immutable`,
    });
    next();
  };
}

/**
 * Stale-while-revalidate cache
 * Serves stale content while fetching fresh data in background
 * Use for: Non-critical data that can be slightly stale
 * @param {number} maxAge - Fresh duration in seconds (default: 300)
 * @param {number} staleWhileRevalidate - Stale duration in seconds (default: 600)
 */
export function staleWhileRevalidate(maxAge = 300, staleWhileRevalidate = 600) {
  return (req, res, next) => {
    res.set({
      'Cache-Control': `private, max-age=${maxAge}, stale-while-revalidate=${staleWhileRevalidate}`,
      'Vary': 'Authorization',
    });
    next();
  };
}

/**
 * ETag generator middleware
 * Generates ETag based on response content for conditional requests
 */
export function etag(req, res, next) {
  const originalSend = res.send;
  
  res.send = function(data) {
    // Generate ETag from response data
    const crypto = require('crypto');
    const hash = crypto.createHash('md5').update(JSON.stringify(data)).digest('hex');
    const etag = `"${hash}"`;
    
    // Set ETag header
    res.set('ETag', etag);
    
    // Check If-None-Match header
    const clientEtag = req.headers['if-none-match'];
    if (clientEtag === etag) {
      // Content hasn't changed, return 304 Not Modified
      res.status(304).end();
      return;
    }
    
    // Content changed, send full response
    originalSend.call(this, data);
  };
  
  next();
}

/**
 * Cache strategy selector based on route patterns
 * Automatically applies appropriate caching strategy
 */
export function smartCache(req, res, next) {
  const path = req.path;
  const method = req.method;
  
  // Only cache GET requests
  if (method !== 'GET') {
    return noCache(req, res, next);
  }
  
  // Health check - no cache
  if (path === '/health') {
    return noCache(req, res, next);
  }
  
  // Auth endpoints - no cache
  if (path.startsWith('/api/auth')) {
    return noCache(req, res, next);
  }
  
  // Project list - short cache (1 minute)
  if (path === '/api/projects' || path.match(/^\/api\/projects\?/)) {
    return shortCache(60)(req, res, next);
  }
  
  // Individual project - medium cache (5 minutes)
  if (path.match(/^\/api\/projects\/[^/]+$/)) {
    return mediumCache(300)(req, res, next);
  }
  
  // Team members - short cache (1 minute)
  if (path.match(/^\/api\/team\/members/)) {
    return shortCache(60)(req, res, next);
  }
  
  // Organization data - medium cache (5 minutes)
  if (path.match(/^\/api\/organizations/)) {
    return mediumCache(300)(req, res, next);
  }
  
  // Default: no cache for safety
  return noCache(req, res, next);
}

export default {
  noCache,
  shortCache,
  mediumCache,
  longCache,
  conditionalCache,
  immutableCache,
  staleWhileRevalidate,
  etag,
  smartCache,
};
