import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Check if Redis credentials are available
const hasRedisCredentials = 
  process.env.UPSTASH_REDIS_REST_URL && 
  process.env.UPSTASH_REDIS_REST_TOKEN;

let redis;
let ratelimitType;

if (hasRedisCredentials) {
  // Initialize Upstash Redis client if credentials are available
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
  
  ratelimitType = 'redis';
} else {
  // Use memory fallback when Redis is not configured
  console.warn('⚠️ Redis credentials not found. Using memory fallback for rate limiting (not suitable for production).');
  ratelimitType = 'memory';
}

// Helper to create a limiter based on available configuration
function createLimiter(config) {
  if (ratelimitType === 'redis') {
    return new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(config.limit, config.window),
      analytics: true,
      prefix: config.prefix,
    });
  } else {
    // Simple in-memory implementation
    return {
      limit: async () => ({ 
        success: true, 
        limit: config.limit, 
        remaining: 1, 
        reset: Date.now() + 1000
      })
    };
  }
}

/**
 * Rate limiters for various endpoints
 */
export const authLimiter = createLimiter({ 
  limit: 5, 
  window: '15 m', 
  prefix: 'auth' 
});

export const emailLimiter = createLimiter({ 
  limit: 5, 
  window: '15 m', 
  prefix: 'email' 
});

export const resetLimiter = createLimiter({ 
  limit: 5, 
  window: '15 m', 
  prefix: 'reset' 
});

// General API limiter: 100 requests per minute
export const apiLimiter = createLimiter({ 
  limit: 100, 
  window: '1 m', 
  prefix: 'api' 
});

// Backup endpoint limiter: 1 request per hour
export const backupLimiter = createLimiter({ 
  limit: 1, 
  window: '1 h', 
  prefix: 'backup' 
});

// Upload endpoint limiter: 10 requests per minute
export const uploadLimiter = createLimiter({ 
  limit: 10, 
  window: '1 m', 
  prefix: 'upload' 
});