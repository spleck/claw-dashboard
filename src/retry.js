/**
 * Retry utility for OpenClaw API calls
 * Implements exponential backoff with configurable options
 */

import logger from './logger.js';
import config from './config.js';

// Default retry configuration
const DEFAULT_OPTIONS = config.DEFAULT_RETRY_OPTIONS;

/**
 * Sleep for specified milliseconds
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} Resolves after delay
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Calculate delay with exponential backoff
 * @param {number} attempt - Current attempt number (0-indexed)
 * @param {object} options - Retry options
 * @returns {number} Delay in milliseconds
 */
function calculateDelay(attempt, options) {
  const delay = Math.min(
    options.initialDelay * Math.pow(options.backoffMultiplier, attempt),
    options.maxDelay
  );
  
  // Add jitter (±10%) to prevent thundering herd
  const jitter = delay * 0.1 * (Math.random() * 2 - 1);
  return Math.floor(delay + jitter);
}

/**
 * Check if error is retryable
 * @param {Error} error - Error object
 * @param {object} options - Retry options
 * @returns {boolean} Whether the error is retryable
 */
function isRetryableError(error, options) {
  // Check for retryable error codes
  if (error.code && options.retryableErrors.includes(error.code)) {
    return true;
  }
  
  // Check for retryable HTTP status codes (if response exists)
  if (error.status && options.retryableStatuses.includes(error.status)) {
    return true;
  }
  
  // Check error message for common retryable patterns
  const message = error.message || '';
  const retryablePatterns = [
    /connection refused/i,
    /timeout/i,
    /network/i,
    /econnreset/i,
    /eai_again/i,
    /temporary failure/i,
    /service unavailable/i,
    /internal server error/i,
    /bad gateway/i,
    /gateway timeout/i,
  ];

  return retryablePatterns.some(pattern => pattern.test(message));
}

/**
 * Wrap a function with retry logic
 * @param {Function} fn - Function to wrap (must return a Promise)
 * @param {object} options - Retry options
 * @returns {Function} Wrapped function
 */
function withRetry(fn, options = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  return async function retryWrapper(...args) {
    let lastError;
    
    for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
      try {
        // Execute the function
        const result = await fn(...args);
        
        // Log successful retry if this wasn't the first attempt
        if (attempt > 0) {
          logger.info(`[RETRY] Operation succeeded after ${attempt} retries`);
        }
        
        return result;
        
      } catch (error) {
        lastError = error;
        
        // Check if we should retry
        const isLastAttempt = attempt >= opts.maxRetries;
        const shouldRetry = !isLastAttempt && isRetryableError(error, opts);
        
        if (!shouldRetry) {
          // Log the final failure
          logger.error(`[RETRY] Operation failed after ${attempt} attempts: ${error.message}`);
          throw error;
        }
        
        // Calculate delay and wait
        const delay = calculateDelay(attempt, opts);
        logger.warn(`[RETRY] Attempt ${attempt + 1}/${opts.maxRetries + 1} failed: ${error.message}. Retrying in ${Math.round(delay)}ms...`);
        await sleep(delay);
      }
    }
    
    // This should never be reached, but just in case
    throw lastError;
  };
}

/**
 * Retry a function until it succeeds or timeout
 * @param {Function} fn - Function to retry
 * @param {number} timeout - Maximum time to keep retrying (ms)
 * @param {number} interval - Time between retries (ms)
 * @returns {Promise} Result of function
 */
async function retryUntil(fn, timeout = config.RETRY.TIMEOUT, interval = config.RETRY.INTERVAL) {
  const startTime = Date.now();
  
  while (true) {
    try {
      return await fn();
    } catch (error) {
      if (Date.now() - startTime >= timeout) {
        throw new Error(`Retry timeout after ${timeout}ms: ${error.message}`);
      }
      logger.warn(`[RETRY] Waiting for condition: ${error.message}`);
      await sleep(interval);
    }
  }
}

/**
 * Create a retryable HTTP request wrapper
 * @param {Function} fetchFn - Fetch function (fetch, axios, etc.)
 * @param {object} options - Retry options
 * @returns {Function} Wrapped fetch function
 */
function createRetryableFetch(fetchFn, options = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  return async function retryableFetch(url, fetchOptions = {}) {
    let lastError;
    
    for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
      try {
        const response = await fetchFn(url, fetchOptions);
        
        // Check if response status is retryable
        if (opts.retryableStatuses.includes(response.status)) {
          const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
          error.status = response.status;
          throw error;
        }
        
        // Return response for non-retryable statuses (caller handles 2xx, 4xx)
        return response;
        
      } catch (error) {
        lastError = error;
        
        // Check if we should retry
        const isLastAttempt = attempt >= opts.maxRetries;
        const shouldRetry = !isLastAttempt && isRetryableError(error, opts);
        
        if (!shouldRetry) {
          throw error;
        }
        
        // Calculate delay and wait
        const delay = calculateDelay(attempt, opts);
        logger.warn(`[RETRY] HTTP request attempt ${attempt + 1}/${opts.maxRetries + 1} failed: ${error.message}. Retrying in ${Math.round(delay)}ms...`);
        await sleep(delay);
      }
    }
    
    throw lastError;
  };
}

/**
 * Batch retry multiple independent operations
 * @param {Array<Function>} fns - Array of functions to execute
 * @param {object} options - Retry options
 * @returns {Promise<Array>} Array of results
 */
async function retryBatch(fns, options = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  // Wrap each function with retry
  const wrappedFns = fns.map(fn => withRetry(fn, opts));
  
  // Execute all in parallel
  return Promise.allSettled(wrappedFns.map(fn => fn()));
}

export default {
  DEFAULT_OPTIONS,
  withRetry,
  retryUntil,
  createRetryableFetch,
  retryBatch,
  sleep,
  calculateDelay,
  isRetryableError
};
