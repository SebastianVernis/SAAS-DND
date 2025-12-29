# Redis Caching Strategy

## Overview
This document describes the Redis caching implementation for improving API response times and reducing database load.

## Goals
- **Reduce database queries**: Cache frequently accessed data
- **Improve response times**: Serve cached data in <5ms instead of 10-50ms database queries
- **Reduce database load**: Minimize repeated queries for the same data
- **Smart invalidation**: Clear cache when data changes

## Redis Configuration

### Environment Variables
```bash
# Enable/disable Redis caching
REDIS_ENABLED=true

# Redis connection URL
REDIS_URL=redis://localhost:6379

# For production with authentication
REDIS_URL=redis://username:password@host:port
```

### Connection Settings
- **Reconnection strategy**: Exponential backoff (100ms → 3000ms max)
- **Max reconnection attempts**: 10
- **Graceful degradation**: If Redis fails, API continues without caching

## Cache Service API

### Core Functions

#### `initializeRedis()`
Initialize Redis connection on server startup.
```javascript
const redisReady = await initializeRedis();
```

#### `getCache(key)`
Get value from cache.
```javascript
const data = await getCache('project:123:full');
// Returns: parsed JSON object or null
```

#### `setCache(key, value, ttl)`
Set value in cache with TTL (Time To Live).
```javascript
await setCache('project:123:full', projectData, 600); // 10 minutes
```

#### `deleteCache(key)`
Delete specific cache key.
```javascript
await deleteCache('project:123:full');
```

#### `deleteCachePattern(pattern)`
Delete all keys matching a pattern.
```javascript
await deleteCachePattern('org:456:*'); // Deletes all org 456 caches
```

#### `cacheWrapper(key, fetchFn, ttl)`
Convenience function: get from cache or execute function and cache result.
```javascript
const data = await cacheWrapper(
  'project:123:full',
  async () => {
    // Fetch from database
    return await db.select()...;
  },
  600 // TTL in seconds
);
```

### Helper Functions

#### Cache Key Generators
```javascript
userCacheKey(userId, suffix)      // 'user:123:profile'
orgCacheKey(orgId, suffix)        // 'org:456:projects'
projectCacheKey(projectId, suffix) // 'project:789:full'
```

#### Cache Invalidation
```javascript
invalidateUserCache(userId)       // Delete all user:123:* keys
invalidateOrgCache(orgId)         // Delete all org:456:* keys
invalidateProjectCache(projectId) // Delete all project:789:* keys
```

## Caching Patterns

### 1. Project List Caching

**Cache Key**: `org:{orgId}:projects:{page}:{limit}:{search}`

**TTL**: 5 minutes (300s)

**Rationale**: Project lists change infrequently but are accessed often (dashboard, project picker)

**Implementation**:
```javascript
// controllers/projectsController.js - getProjects()
const cacheKey = orgCacheKey(organizationId, `projects:${page}:${limit}:${search || 'all'}`);
const result = await cacheWrapper(cacheKey, async () => {
  // Fetch from database
  return await db.select()...;
}, 300);
```

**Invalidation**: When project is created, updated, or deleted
```javascript
await invalidateOrgCache(organizationId); // Clears all org:456:* keys
```

---

### 2. Single Project Caching

**Cache Key**: `project:{projectId}:full`

**TTL**: 10 minutes (600s)

**Rationale**: Individual projects are accessed frequently (editor, preview) and change less often

**Implementation**:
```javascript
// controllers/projectsController.js - getProject()
const cacheKey = projectCacheKey(projectId, 'full');
const data = await cacheWrapper(cacheKey, async () => {
  // Fetch project + components with JOIN
  return { project, components };
}, 600);
```

**Invalidation**: When project is updated or deleted
```javascript
await invalidateProjectCache(projectId);  // Clears project:789:*
await invalidateOrgCache(organizationId); // Also clear org list cache
```

---

### 3. User Session Caching (Future)

**Cache Key**: `user:{userId}:session`

**TTL**: 1 hour (3600s)

**Rationale**: User data is accessed on every authenticated request (auth middleware)

**Implementation** (not yet implemented):
```javascript
// middleware/auth.js
const cacheKey = userCacheKey(userId, 'session');
const userData = await cacheWrapper(cacheKey, async () => {
  // Fetch user + membership + org + subscription
  return { user, membership, organization, subscription };
}, 3600);
```

**Invalidation**: When user updates profile, changes organization, or subscription changes

---

## Cache Invalidation Strategy

### Principle: Invalidate on Write
When data changes, immediately invalidate related caches.

### Invalidation Patterns

#### 1. Project Operations
```javascript
// CREATE project
await invalidateOrgCache(orgId); // Clear org project lists

// UPDATE project
await invalidateProjectCache(projectId); // Clear this project
await invalidateOrgCache(orgId);         // Clear org project lists

// DELETE project
await invalidateProjectCache(projectId); // Clear this project
await invalidateOrgCache(orgId);         // Clear org project lists
```

#### 2. Organization Operations (Future)
```javascript
// UPDATE organization
await invalidateOrgCache(orgId);         // Clear all org caches
await invalidateUserCache(userId);       // Clear user session cache

// ADD/REMOVE member
await invalidateOrgCache(orgId);         // Clear org caches
await invalidateUserCache(newMemberId);  // Clear new member's cache
```

#### 3. User Operations (Future)
```javascript
// UPDATE user profile
await invalidateUserCache(userId);       // Clear user caches

// CHANGE subscription
await invalidateOrgCache(orgId);         // Clear org caches
await invalidateUserCache(userId);       // Clear user caches
```

---

## Performance Impact

### Before Caching
| Operation | Database Queries | Time |
|-----------|------------------|------|
| Get project list | 1 | ~15ms |
| Get single project | 1 (with JOIN) | ~12ms |
| **Total for 10 requests** | **10** | **~150ms** |

### After Caching (Cache Hit)
| Operation | Database Queries | Time |
|-----------|------------------|------|
| Get project list | 0 (cached) | ~2ms |
| Get single project | 0 (cached) | ~2ms |
| **Total for 10 requests** | **0** | **~20ms** |

### Expected Improvements
- **Cache hit rate**: 70-90% (depends on traffic patterns)
- **Response time reduction**: 80-90% for cached requests
- **Database load reduction**: 70-90% fewer queries
- **Scalability**: Can handle 10x more requests with same database

---

## Cache Hit/Miss Monitoring

### Logging
Cache operations are logged in development mode:
```
✅ Cache HIT: project:123:full
❌ Cache MISS: org:456:projects:1:20:all
✅ Cache SET: project:123:full (TTL: 600s)
✅ Cache DELETE pattern: org:456:* (3 keys)
```

### Metrics to Track (Future)
```javascript
// Track cache performance
const cacheStats = {
  hits: 0,
  misses: 0,
  hitRate: () => hits / (hits + misses),
};
```

### Redis Monitoring Commands
```bash
# Check Redis connection
redis-cli ping

# Monitor cache operations in real-time
redis-cli monitor

# Check memory usage
redis-cli info memory

# List all keys (development only!)
redis-cli keys '*'

# Check specific key
redis-cli get "project:123:full"

# Check key TTL
redis-cli ttl "project:123:full"
```

---

## Best Practices

### 1. Cache Key Naming Convention
```
{resource}:{id}:{suffix}

Examples:
user:123:profile
user:123:session
org:456:projects:1:20:all
org:456:members
project:789:full
project:789:metadata
```

### 2. TTL Guidelines
- **Frequently changing data**: 1-5 minutes
- **Moderately changing data**: 5-15 minutes
- **Rarely changing data**: 15-60 minutes
- **Static data**: 1-24 hours

### 3. Cache Invalidation
- **Always invalidate on write**: Don't rely on TTL alone
- **Invalidate related caches**: If project changes, invalidate org list
- **Use pattern deletion**: `org:456:*` clears all org caches

### 4. Graceful Degradation
- **Never fail requests due to cache errors**: Always fall back to database
- **Log cache errors**: Monitor for Redis issues
- **Continue without cache**: If Redis is down, API still works

### 5. Avoid Cache Stampede
When cache expires and many requests hit at once:
```javascript
// Use cache locking (future enhancement)
const lock = await acquireLock(`lock:${cacheKey}`);
if (lock) {
  const data = await fetchFromDatabase();
  await setCache(cacheKey, data, ttl);
  await releaseLock(`lock:${cacheKey}`);
}
```

---

## Testing Caching

### Manual Testing
```bash
# 1. Start Redis
docker run -d -p 6379:6379 redis:alpine

# 2. Enable Redis in .env
REDIS_ENABLED=true
REDIS_URL=redis://localhost:6379

# 3. Start server
npm run dev

# 4. Make request (cache miss)
curl -H "Authorization: Bearer $TOKEN" http://localhost:3001/api/projects

# 5. Make same request again (cache hit - should be faster)
curl -H "Authorization: Bearer $TOKEN" http://localhost:3001/api/projects

# 6. Update a project (invalidates cache)
curl -X PUT -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated"}' \
  http://localhost:3001/api/projects/123

# 7. Make request again (cache miss - data changed)
curl -H "Authorization: Bearer $TOKEN" http://localhost:3001/api/projects
```

### Automated Testing
```javascript
// Test cache wrapper
test('cacheWrapper should cache results', async () => {
  let callCount = 0;
  const fetchFn = async () => {
    callCount++;
    return { data: 'test' };
  };

  // First call - cache miss
  const result1 = await cacheWrapper('test:key', fetchFn, 60);
  expect(callCount).toBe(1);

  // Second call - cache hit
  const result2 = await cacheWrapper('test:key', fetchFn, 60);
  expect(callCount).toBe(1); // Still 1, not called again
  expect(result2).toEqual(result1);
});
```

---

## Troubleshooting

### Redis Connection Issues
```bash
# Check if Redis is running
redis-cli ping
# Expected: PONG

# Check Redis logs
docker logs <redis-container-id>

# Test connection from Node.js
node -e "import('redis').then(r => r.createClient().connect().then(() => console.log('OK')))"
```

### Cache Not Working
1. Check `REDIS_ENABLED=true` in `.env`
2. Check Redis connection in server logs
3. Check cache logs (debug mode)
4. Verify cache keys are correct

### Cache Not Invalidating
1. Check invalidation calls in controllers
2. Verify pattern matching (`org:456:*`)
3. Check Redis logs for DELETE operations

### Memory Issues
```bash
# Check Redis memory usage
redis-cli info memory

# Set max memory limit
redis-cli config set maxmemory 256mb
redis-cli config set maxmemory-policy allkeys-lru
```

---

## Future Enhancements

### 1. Cache Warming
Pre-populate cache on server startup:
```javascript
async function warmCache() {
  // Cache popular projects
  const popularProjects = await getPopularProjects();
  for (const project of popularProjects) {
    await setCache(projectCacheKey(project.id, 'full'), project, 3600);
  }
}
```

### 2. Cache Analytics
Track cache performance:
```javascript
const cacheMetrics = {
  hits: new Map(),
  misses: new Map(),
  avgResponseTime: new Map(),
};
```

### 3. Distributed Caching
For multi-server deployments, ensure cache consistency:
- Use Redis Cluster
- Implement cache invalidation pub/sub
- Consider cache versioning

### 4. Cache Compression
For large objects, compress before caching:
```javascript
import zlib from 'zlib';

async function setCompressedCache(key, value, ttl) {
  const compressed = zlib.gzipSync(JSON.stringify(value));
  await redisClient.setEx(key, ttl, compressed);
}
```

---

## Security Considerations

### 1. Cache Key Security
- **Never include sensitive data in keys**: Use IDs, not emails or tokens
- **Validate access**: Check permissions before serving cached data

### 2. Cache Poisoning Prevention
- **Validate data before caching**: Ensure data integrity
- **Use TTL**: Don't cache forever
- **Invalidate on security events**: Clear cache on password change, etc.

### 3. Redis Security
- **Use authentication**: Set `requirepass` in Redis config
- **Use TLS**: For production, use `rediss://` protocol
- **Network isolation**: Don't expose Redis to public internet

---

## Conclusion

Redis caching provides significant performance improvements:
- **80-90% faster** response times for cached data
- **70-90% reduction** in database load
- **10x scalability** improvement
- **Graceful degradation** if Redis fails

The caching strategy is designed to be:
- **Transparent**: Works without code changes in most places
- **Safe**: Falls back to database if cache fails
- **Smart**: Invalidates automatically on data changes
- **Monitorable**: Logs all cache operations

For questions or issues, check the troubleshooting section or contact the development team.
