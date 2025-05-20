import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Check if Upstash feature is enabled (defaults to true if not specified)
const isUpstashEnabled = process.env.ENABLE_UPSTASH !== 'false';

// Check if we are in test mode
const isTestMode = process.env.NODE_ENV === 'test' || process.env.BYPASS_RATELIMIT === 'true';

// Check if Redis credentials are available
const hasRedisCredentials = 
  process.env.UPSTASH_REDIS_REST_URL && 
  process.env.UPSTASH_REDIS_REST_TOKEN;

let redis;
let ratelimitType;

if (!isUpstashEnabled || isTestMode) {
  console.info('ℹ️ Rate limiting is disabled (reason: ' + 
               (isTestMode ? 'test mode' : 'ENABLE_UPSTASH environment variable') + ')');
  console.info('ℹ️ Rate limiting is completely bypassed');
  ratelimitType = 'disabled';
} else if (hasRedisCredentials) {
  try {
    // Initialize Upstash Redis client if feature is enabled and credentials are available
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
    ratelimitType = 'redis';
    console.log('✅ Upstash Redis connected successfully for rate limiting');
  } catch (error) {
    // If Redis initialization fails, fallback to disabled mode
    console.error('❌ Failed to connect to Upstash Redis:', error.message);
    console.warn('⚠️ Rate limiting fallback to disabled mode due to connection error');
    ratelimitType = 'disabled';
  }
} else {
  // Use memory fallback when Redis is not configured but feature is enabled
  console.warn('⚠️ Redis credentials not found.');
  console.warn('⚠️ Using memory fallback for rate limiting (not suitable for production)');
  ratelimitType = 'memory';
}

// Helper to create a limiter based on available configuration
function createLimiter(config) {
  // If rate limiting is disabled, always bypass
  if (ratelimitType === 'disabled') {
    return {
      limit: async () => ({ 
        success: true, 
        limit: config.limit, 
        remaining: config.limit, 
        reset: Date.now() 
      })
    };
  }
  
  // If Upstash is enabled, use Redis if available, otherwise use memory fallback
  if (ratelimitType === 'redis') {
    try {
      return new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(config.limit, config.window),
        analytics: true,
        prefix: config.prefix,
      });
    } catch (error) {
      console.error(`❌ Error creating Redis rate limiter for ${config.prefix}:`, error.message);
      console.warn('⚠️ Falling back to disabled rate limiting for this endpoint');
      
      // If Redis rate limiter creation fails, fallback to disabled
      return {
        limit: async () => ({ 
          success: true, 
          limit: config.limit, 
          remaining: config.limit, 
          reset: Date.now() 
        })
      };
    }
  } else if (ratelimitType === 'memory') {
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

// Crawler endpoint limiter: 5 requests per minute (mais restritivo por causa da intensidade de recursos)
export const crawlerLimiter = createLimiter({ 
  limit: 5, 
  window: '1 m', 
  prefix: 'crawler' 
});