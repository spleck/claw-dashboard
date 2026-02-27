/**
 * Cache module with TTL support for system metrics
 * Provides caching for expensive systeminformation calls
 * Supports worker threads for heavy operations
 */

import config from './config.js';
import logger from './logger.js';

// Worker pool for heavy operations (lazy-loaded)
let workerPool = null;

/**
 * Get the worker pool instance (lazy initialization)
 * @returns {Object|null} Worker pool instance or null if not available
 */
async function getWorkerPool() {
  if (!config.WORKERS?.ENABLED) {
    return null;
  }

  if (!workerPool) {
    try {
      const { default: pool } = await import('./workers/worker-pool.js');
      workerPool = pool;
    } catch (error) {
      logger.debug('Worker pool not available:', error.message);
      return null;
    }
  }

  return workerPool;
}

// In-memory cache store
const cache = new Map();

/**
 * Cache configuration for different data types
 */
// Use CACHE_CONFIG from config.js

/**
 * Get a cached value if still valid
 * @param {string} key - Cache key
 * @returns {any|null} Cached value or null if expired/missing
 */
export function get(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  
  return entry.value;
}

/**
 * Set a cached value with TTL
 * @param {string} key - Cache key
 * @param {any} value - Value to cache
 * @param {number} ttl - Time to live in milliseconds (optional, uses config default)
 */
export function set(key, value, ttl) {
  const cacheTtlConfig = config.CACHE_CONFIG[key] || { ttl: config.CACHE_TTL.DEFAULT };
  const actualTtl = ttl || cacheTtlConfig.ttl;
  
  cache.set(key, {
    value,
    expiresAt: Date.now() + actualTtl,
    createdAt: Date.now(),
  });
}

/**
 * Get or fetch data with caching
 * @param {string} key - Cache key
 * @param {Function} fetcher - Async function to fetch data if cache miss
 * @param {number} ttl - Optional TTL override
 * @returns {Promise<any>} Cached or fresh data
 */
export async function getOrFetch(key, fetcher, ttl) {
  const cached = get(key);
  if (cached !== null) {
    return cached;
  }
  
  const data = await fetcher();
  set(key, data, ttl);
  return data;
}

/**
 * Execute a systeminformation command via worker thread or fallback
 * @param {string} command - Worker command name
 * @param {Function} fallbackFn - Fallback function for direct execution
 * @returns {Promise<any>} Command result
 */
async function executeWithWorker(command, fallbackFn) {
  const pool = await getWorkerPool();
  if (pool) {
    try {
      return await pool.execute(command);
    } catch (error) {
      logger.debug(`Worker execution failed for ${command}, using fallback: ${error.message}`);
    }
  }
  return fallbackFn();
}

/**
 * Get cached CPU data or fetch fresh
 * Uses worker threads when available to avoid blocking the UI
 * @returns {Promise<Object>} CPU load data
 */
export async function getCpuData() {
  return getOrFetch('cpu', async () => {
    try {
      return await executeWithWorker('currentLoad', async () => {
        const si = await import('systeminformation');
        return await si.currentLoad();
      });
    } catch (e) {
      logger.warn(`systeminformation.currentLoad() failed: ${e.message}`);
      throw e;
    }
  });
}

/**
 * Get cached memory data or fetch fresh
 * Uses worker threads when available to avoid blocking the UI
 * @returns {Promise<Object>} Memory data
 */
export async function getMemoryData() {
  return getOrFetch('memory', async () => {
    try {
      return await executeWithWorker('mem', async () => {
        const si = await import('systeminformation');
        return await si.mem();
      });
    } catch (e) {
      logger.warn(`systeminformation.mem() failed: ${e.message}`);
      throw e;
    }
  });
}

/**
 * Get cached GPU data or fetch fresh
 * Uses worker threads when available to avoid blocking the UI
 * @returns {Promise<Object>} GPU/graphics data
 */
export async function getGpuData() {
  return getOrFetch('gpu', async () => {
    try {
      return await executeWithWorker('graphics', async () => {
        const si = await import('systeminformation');
        return await si.graphics();
      });
    } catch (e) {
      logger.warn(`systeminformation.graphics() failed: ${e.message}`);
      throw e;
    }
  });
}

/**
 * Get cached network data or fetch fresh
 * Uses worker threads when available to avoid blocking the UI
 * @returns {Promise<Object>} Network stats data
 */
export async function getNetworkData() {
  return getOrFetch('network', async () => {
    try {
      return await executeWithWorker('networkStats', async () => {
        const si = await import('systeminformation');
        return await si.networkStats();
      });
    } catch (e) {
      logger.warn(`systeminformation.networkStats() failed: ${e.message}`);
      throw e;
    }
  });
}

/**
 * Get cached disk data or fetch fresh
 * Uses worker threads when available to avoid blocking the UI
 * @returns {Promise<Object>} Disk size data
 */
export async function getDiskData() {
  return getOrFetch('disk', async () => {
    try {
      return await executeWithWorker('fsSize', async () => {
        const si = await import('systeminformation');
        return await si.fsSize();
      });
    } catch (e) {
      logger.warn(`systeminformation.fsSize() failed: ${e.message}`);
      throw e;
    }
  });
}

/**
 * Get cached system info data or fetch fresh
 * Uses worker threads when available to avoid blocking the UI
 * @returns {Promise<Object>} System info (osInfo, versions, time)
 */
export async function getSystemData() {
  return getOrFetch('system', async () => {
    try {
      return await executeWithWorker('systemData', async () => {
        const si = await import('systeminformation');
        const [os, ver, time] = await Promise.all([
          si.osInfo(),
          si.versions(),
          si.time(),
        ]);
        return { os, ver, time };
      });
    } catch (e) {
      logger.warn(`systeminformation system data fetch failed: ${e.message}`);
      throw e;
    }
  });
}

/**
 * Force refresh a specific cache entry
 * @param {string} key - Cache key to refresh
 */
export function invalidate(key) {
  cache.delete(key);
}

/**
 * Clear all cache entries
 */
export function clear() {
  cache.clear();
}

/**
 * Get cache status for debugging
 * @returns {Object} Cache status info
 */
export function getStatus() {
  const now = Date.now();
  const status = {};
  
  for (const [key, entry] of cache) {
    const remaining = Math.max(0, entry.expiresAt - now);
    status[key] = {
      cached: true,
      age: now - entry.createdAt,
      ttlRemaining: remaining,
      configTtl: config.CACHE_CONFIG[key]?.ttl || config.CACHE_TTL.DEFAULT,
    };
  }
  
  return status;
}

/**
 * Debounce utility for rapid key presses
 * @param {Function} fn - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(fn, delay) {
  let timeoutId = null;
  let lastArgs = null;
  
  return function(...args) {
    lastArgs = args;
    
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      fn.apply(this, lastArgs);
      timeoutId = null;
    }, delay);
  };
}

/**
 * Throttle utility for rate limiting
 * @param {Function} fn - Function to throttle
 * @param {number} limit - Minimum interval between calls in ms
 * @returns {Function} Throttled function
 */
export function throttle(fn, limit) {
  let lastCall = 0;
  let timeoutId = null;
  
  return function(...args) {
    const now = Date.now();
    const remaining = limit - (now - lastCall);
    
    if (remaining <= 0) {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      lastCall = now;
      fn.apply(this, args);
    } else if (!timeoutId) {
      timeoutId = setTimeout(() => {
        lastCall = Date.now();
        timeoutId = null;
        fn.apply(this, args);
      }, remaining);
    }
  };
}

export default {
  get,
  set,
  getOrFetch,
  getCpuData,
  getMemoryData,
  getGpuData,
  getNetworkData,
  getDiskData,
  getSystemData,
  invalidate,
  clear,
  getStatus,
  debounce,
  throttle,
  CACHE_CONFIG: config.CACHE_CONFIG,
};
