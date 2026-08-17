// Simple in-memory sliding window rate limiter for API routes
const rateLimitMap = new Map();

/**
 * Rate limits requests per key (e.g. IP address or user ID).
 * @param {string} key - Unique identifier for the client (IP or User ID)
 * @param {number} limit - Maximum allowed requests within the time window
 * @param {number} windowMs - Time window in milliseconds (default: 1 minute)
 * @returns {{ success: boolean, remaining: number, resetMs: number }}
 */
export function checkRateLimit(key, limit = 60, windowMs = 60000) {
  const now = Date.now();
  const record = rateLimitMap.get(key) || { timestamps: [] };

  // Remove timestamps outside the sliding window
  const validTimestamps = record.timestamps.filter((ts) => now - ts < windowMs);

  if (validTimestamps.length >= limit) {
    const oldestTimestamp = validTimestamps[0];
    const resetMs = windowMs - (now - oldestTimestamp);
    return {
      success: false,
      remaining: 0,
      resetMs,
    };
  }

  validTimestamps.push(now);
  rateLimitMap.set(key, { timestamps: validTimestamps });

  // Cleanup old map entries periodically
  if (rateLimitMap.size > 10000) {
    for (const [k, v] of rateLimitMap.entries()) {
      if (v.timestamps.length === 0 || now - v.timestamps[v.timestamps.length - 1] > windowMs) {
        rateLimitMap.delete(k);
      }
    }
  }

  return {
    success: true,
    remaining: limit - validTimestamps.length,
    resetMs: windowMs,
  };
}
