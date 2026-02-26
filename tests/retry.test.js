/**
 * Integration tests for retry logic with mock failures
 */

import retry from '../src/retry.js';

// Simple mock helper that properly tracks call counts
function createMockFn(successValue, errorSequence = []) {
  let errorIndex = 0;
  return async (...args) => {
    if (errorIndex < errorSequence.length) {
      const err = errorSequence[errorIndex++];
      throw err;
    }
    return successValue;
  };
}

describe('Retry Logic', () => {
  describe('withRetry', () => {
    test('should succeed on first attempt when function succeeds', async () => {
      let callCount = 0;
      const fn = async () => {
        callCount++;
        return 'success';
      };
      
      const wrapped = retry.withRetry(fn);
      const result = await wrapped();
      
      expect(result).toBe('success');
      expect(callCount).toBe(1);
    });

    test('should retry on failure and eventually succeed', async () => {
      const mockFn = createMockFn(
        'success',
        [new Error('First failure'), new Error('Second failure')]
      );
      
      const wrapped = retry.withRetry(mockFn);
      const result = await wrapped();
      
      expect(result).toBe('success');
    });

    test('should fail after max retries exceeded', async () => {
      const error = new Error('Persistent failure');
      const mockFn = async () => {
        throw error;
      };
      
      const wrapped = retry.withRetry(mockFn, { maxRetries: 2 });
      
      await expect(wrapped()).rejects.toThrow('Persistent failure');
    });

    test('should not retry on non-retryable errors', async () => {
      const error = new Error('Bad Request');
      error.status = 400;
      let callCount = 0;
      const mockFn = async () => {
        callCount++;
        throw error;
      };
      
      const wrapped = retry.withRetry(mockFn);
      
      await expect(wrapped()).rejects.toThrow('Bad Request');
      expect(callCount).toBe(1);
    });

    test('should retry on retryable HTTP status codes', async () => {
      const mockFn = createMockFn(
        'success',
        [{ message: 'Server Error', status: 500 }]
      );
      
      const wrapped = retry.withRetry(mockFn);
      const result = await wrapped();
      
      expect(result).toBe('success');
    });

    test('should retry on retryable error codes', async () => {
      const mockFn = createMockFn(
        'success',
        [{ message: 'Connection refused', code: 'ECONNREFUSED' }]
      );
      
      const wrapped = retry.withRetry(mockFn);
      const result = await wrapped();
      
      expect(result).toBe('success');
    });

    test('should respect custom maxRetries option', async () => {
      const error = new Error('Always fails');
      let attempts = 0;
      const mockFn = async () => {
        attempts++;
        throw error;
      };
      
      const wrapped = retry.withRetry(mockFn, { maxRetries: 5, initialDelay: 100 });
      
      await expect(wrapped()).rejects.toThrow();
      expect(attempts).toBe(6);
    }, 30000);

    test('should pass arguments to wrapped function', async () => {
      let receivedArgs = null;
      const mockFn = async (...args) => {
        receivedArgs = args;
        return 'result';
      };
      
      const wrapped = retry.withRetry(mockFn);
      await wrapped('arg1', 'arg2');
      
      expect(receivedArgs).toEqual(['arg1', 'arg2']);
    });

    test('should use custom retryable statuses', async () => {
      const mockFn = createMockFn(
        'success',
        [{ message: 'Bad Request', status: 400 }]
      );
      
      const wrapped = retry.withRetry(mockFn, { 
        retryableStatuses: [400, 500] 
      });
      
      const result = await wrapped();
      expect(result).toBe('success');
    });
  });

  describe('calculateDelay', () => {
    test('should calculate exponential backoff delay', () => {
      const options = {
        initialDelay: 1000,
        maxDelay: 10000,
        backoffMultiplier: 2
      };
      
      const delay0 = retry.calculateDelay(0, options);
      expect(delay0).toBeGreaterThanOrEqual(900);
      expect(delay0).toBeLessThanOrEqual(1100);
      
      const delay1 = retry.calculateDelay(1, options);
      expect(delay1).toBeGreaterThanOrEqual(1800);
      expect(delay1).toBeLessThanOrEqual(2200);
      
      const delay2 = retry.calculateDelay(2, options);
      expect(delay2).toBeGreaterThanOrEqual(3600);
      expect(delay2).toBeLessThanOrEqual(4400);
    });

    test('should not exceed maxDelay', () => {
      const options = {
        initialDelay: 1000,
        maxDelay: 5000,
        backoffMultiplier: 2
      };
      
      const delay = retry.calculateDelay(10, options);
      expect(delay).toBeLessThanOrEqual(5500);
    });
  });

  describe('isRetryableError', () => {
    test('should return true for retryable error codes', () => {
      const options = { retryableErrors: ['ECONNREFUSED', 'ETIMEDOUT'] };
      
      expect(retry.isRetryableError({ code: 'ECONNREFUSED' }, options)).toBe(true);
      expect(retry.isRetryableError({ code: 'ETIMEDOUT' }, options)).toBe(true);
    });

    test('should return true for retryable HTTP statuses', () => {
      const options = { retryableStatuses: [500, 503] };
      
      expect(retry.isRetryableError({ status: 500 }, options)).toBe(true);
      expect(retry.isRetryableError({ status: 503 }, options)).toBe(true);
    });

    test('should return false for non-retryable errors', () => {
      const options = { 
        retryableErrors: ['ECONNREFUSED'],
        retryableStatuses: [500]
      };
      
      expect(retry.isRetryableError({ code: 'ENOMEM' }, options)).toBe(false);
      expect(retry.isRetryableError({ status: 404 }, options)).toBe(false);
      // Use truly non-retryable message
      expect(retry.isRetryableError({ message: 'Invalid input provided' }, options)).toBe(false);
    });
  });

  describe('retryUntil', () => {
    test('should succeed when function eventually succeeds', async () => {
      let attempts = 0;
      const fn = async () => {
        attempts++;
        if (attempts < 3) {
          throw new Error('Not ready yet');
        }
        return 'ready';
      };
      
      const result = await retry.retryUntil(fn, 5000, 50);
      
      expect(result).toBe('ready');
      expect(attempts).toBe(3);
    });

    test('should timeout when function never succeeds', async () => {
      const fn = async () => {
        throw new Error('Always fails');
      };
      
      await expect(
        retry.retryUntil(fn, 100, 20)
      ).rejects.toThrow('Retry timeout');
    });
  });

  describe('createRetryableFetch', () => {
    test('should retry on 5xx errors', async () => {
      let attempts = 0;
      const mockFetch = async () => {
        attempts++;
        if (attempts === 1) {
          throw { message: 'Server Error', status: 500 };
        }
        return { status: 200, data: 'ok' };
      };
      
      const wrappedFetch = retry.createRetryableFetch(mockFetch);
      const response = await wrappedFetch('http://test.com');
      
      expect(response.status).toBe(200);
      expect(attempts).toBe(2);
    });

    test('should not retry on 4xx errors', async () => {
      let attempts = 0;
      const mockFetch = async () => {
        attempts++;
        return { status: 404, statusText: 'Not Found' };
      };
      
      const wrappedFetch = retry.createRetryableFetch(mockFetch);
      const response = await wrappedFetch('http://test.com');
      
      expect(response.status).toBe(404);
      expect(attempts).toBe(1);
    });
  });

  describe('retryBatch', () => {
    test('should execute all functions with retries', async () => {
      let callCount1 = 0;
      let callCount3 = 0;
      const fn1 = async () => {
        callCount1++;
        if (callCount1 === 1) throw new Error('fail');
        return 'result1';
      };
      const fn2 = async () => 'result2';
      const fn3 = async () => {
        callCount3++;
        if (callCount3 < 3) throw new Error('fail');
        return 'result3';
      };
      
      const results = await retry.retryBatch([fn1, fn2, fn3], { maxRetries: 2 });
      
      expect(results[0].status).toBe('fulfilled');
      expect(results[0].value).toBe('result1');
      expect(results[1].status).toBe('fulfilled');
      expect(results[1].value).toBe('result2');
      expect(results[2].status).toBe('fulfilled');
      expect(results[2].value).toBe('result3');
    });

    test('should handle batch with all failures', async () => {
      const fn1 = async () => { throw new Error('fail'); };
      const fn2 = async () => { throw new Error('fail'); };
      
      const results = await retry.retryBatch([fn1, fn2], { maxRetries: 1 });
      
      expect(results[0].status).toBe('rejected');
      expect(results[1].status).toBe('rejected');
    });
  });

  describe('DEFAULT_OPTIONS', () => {
    test('should have sensible defaults', () => {
      expect(retry.DEFAULT_OPTIONS.maxRetries).toBe(3);
      expect(retry.DEFAULT_OPTIONS.initialDelay).toBe(1000);
      expect(retry.DEFAULT_OPTIONS.maxDelay).toBe(10000);
      expect(retry.DEFAULT_OPTIONS.backoffMultiplier).toBe(2);
      expect(retry.DEFAULT_OPTIONS.retryableStatuses).toContain(500);
      expect(retry.DEFAULT_OPTIONS.retryableErrors).toContain('ECONNREFUSED');
    });
  });
});
