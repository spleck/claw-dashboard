/**
 * Tests for cache module
 * TTL cache, getOrFetch, debounce/throttle utilities
 */

import {
  get,
  set,
  getOrFetch,
  invalidate,
  clear,
  getStatus,
  debounce,
  throttle,
} from '../src/cache.js';

describe('cache', () => {
  beforeEach(() => {
    // Clear cache before each test
    clear();
  });

  describe('get', () => {
    test('should return null for missing key', () => {
      expect(get('nonexistent')).toBeNull();
    });

    test('should return null for expired entry', async () => {
      set('test', 'value', 10); // Very short TTL
      await new Promise(resolve => setTimeout(resolve, 20));
      expect(get('test')).toBeNull();
    });

    test('should return value for valid cache entry', () => {
      set('test', 'value', 5000);
      expect(get('test')).toBe('value');
    });

    test('should handle different value types', () => {
      set('string', 'hello');
      set('number', 42);
      set('boolean', true);
      set('object', { key: 'value' });
      set('array', [1, 2, 3]);

      expect(get('string')).toBe('hello');
      expect(get('number')).toBe(42);
      expect(get('boolean')).toBe(true);
      expect(get('object')).toEqual({ key: 'value' });
      expect(get('array')).toEqual([1, 2, 3]);
    });

    test('should handle null values', () => {
      set('null', null, 5000);
      expect(get('null')).toBeNull();
    });

    test('should handle undefined values', () => {
      set('undefined', undefined, 5000);
      expect(get('undefined')).toBeUndefined();
    });
  });

  describe('set', () => {
    test('should store value with TTL', () => {
      set('key', 'value', 1000);
      expect(get('key')).toBe('value');
    });

    test('should use default TTL from config', () => {
      set('key', 'value'); // No TTL specified
      expect(get('key')).toBe('value');
    });

    test('should overwrite existing entry', () => {
      set('key', 'old');
      set('key', 'new');
      expect(get('key')).toBe('new');
    });
  });

  describe('getOrFetch', () => {
    test('should return cached value if available', async () => {
      set('key', 'cached', 5000);
      const mockFetcher = () => Promise.resolve('should-not-be-called');
      const result = await getOrFetch('key', mockFetcher);
      expect(result).toBe('cached');
    });

    test('should fetch data on cache miss', async () => {
      const mockFetcher = () => Promise.resolve('fresh');
      const result = await getOrFetch('key', mockFetcher);

      expect(result).toBe('fresh');
    });

    test('should cache fetched data', async () => {
      let callCount = 0;
      const mockFetcher = () => {
        callCount++;
        return Promise.resolve('fresh');
      };
      await getOrFetch('key', mockFetcher);

      // Second call should use cache
      const result = await getOrFetch('key', mockFetcher);
      expect(result).toBe('fresh');
      expect(callCount).toBe(1);
    });

    test('should use custom TTL when provided', async () => {
      let callCount = 0;
      const mockFetcher = () => {
        callCount++;
        return Promise.resolve('value');
      };
      await getOrFetch('key', mockFetcher, 50);

      // Wait for TTL to expire
      await new Promise(resolve => setTimeout(resolve, 100));

      // Fetcher should be called again
      const result = await getOrFetch('key', mockFetcher);

      expect(result).toBe('value');
      expect(callCount).toBe(2);
    });

    test('should handle async fetcher errors', async () => {
      const mockFetcher = () => Promise.reject(new Error('fetch failed'));

      await expect(getOrFetch('key', mockFetcher)).rejects.toThrow('fetch failed');
    });
  });

  describe('invalidate', () => {
    test('should remove specific cache entry', () => {
      set('key1', 'value1');
      set('key2', 'value2');

      invalidate('key1');

      expect(get('key1')).toBeNull();
      expect(get('key2')).toBe('value2');
    });

    test('should handle invalidating non-existent key', () => {
      expect(() => invalidate('nonexistent')).not.toThrow();
    });
  });

  describe('clear', () => {
    test('should remove all cache entries', () => {
      set('key1', 'value1');
      set('key2', 'value2');

      clear();

      expect(get('key1')).toBeNull();
      expect(get('key2')).toBeNull();
    });

    test('should work on empty cache', () => {
      expect(() => clear()).not.toThrow();
    });
  });

  describe('getStatus', () => {
    test('should return empty object for empty cache', () => {
      const status = getStatus();
      expect(status).toEqual({});
    });

    test('should return status for cached entries', () => {
      set('key', 'value', 5000);

      const status = getStatus();

      expect(status.key).toBeDefined();
      expect(status.key.cached).toBe(true);
      expect(status.key.age).toBeDefined();
      expect(status.key.ttlRemaining).toBeDefined();
      expect(status.key.configTtl).toBeDefined();
    });

    test('should show remaining TTL', async () => {
      set('key', 'value', 200);

      const statusBefore = getStatus();
      expect(statusBefore.key.ttlRemaining).toBeGreaterThan(100);

      await new Promise(resolve => setTimeout(resolve, 150));

      const statusAfter = getStatus();
      expect(statusAfter.key.ttlRemaining).toBeLessThan(100);
    });
  });
});

describe('debounce', () => {
  test('should delay function execution', async () => {
    let called = false;
    const fn = () => { called = true; };
    const debounced = debounce(fn, 50);

    debounced();

    expect(called).toBe(false);

    await new Promise(resolve => setTimeout(resolve, 60));

    expect(called).toBe(true);
  });

  test('should only call function once for rapid calls', async () => {
    let callCount = 0;
    const fn = () => { callCount++; };
    const debounced = debounce(fn, 50);

    debounced();
    debounced();
    debounced();

    await new Promise(resolve => setTimeout(resolve, 60));

    expect(callCount).toBe(1);
  });

  test('should pass arguments to debounced function', async () => {
    let receivedArgs = null;
    const fn = (...args) => { receivedArgs = args; };
    const debounced = debounce(fn, 50);

    debounced('arg1', 'arg2');

    await new Promise(resolve => setTimeout(resolve, 60));

    expect(receivedArgs).toEqual(['arg1', 'arg2']);
  });

  test('should reset delay on each call', async () => {
    let callCount = 0;
    const fn = () => { callCount++; };
    const debounced = debounce(fn, 50);

    debounced();
    await new Promise(resolve => setTimeout(resolve, 30));
    debounced();
    await new Promise(resolve => setTimeout(resolve, 30));

    expect(callCount).toBe(0);

    await new Promise(resolve => setTimeout(resolve, 30));

    expect(callCount).toBe(1);
  });
});

describe('throttle', () => {
  test('should execute function immediately on first call', () => {
    let called = false;
    const fn = () => { called = true; };
    const throttled = throttle(fn, 100);

    throttled();

    expect(called).toBe(true);
  });

  test('should not execute again within limit period', async () => {
    let callCount = 0;
    const fn = () => { callCount++; };
    const throttled = throttle(fn, 100);

    throttled();
    throttled();
    throttled();

    expect(callCount).toBe(1);
  });

  test('should execute again after limit period', async () => {
    let callCount = 0;
    const fn = () => { callCount++; };
    const throttled = throttle(fn, 50);

    throttled();
    await new Promise(resolve => setTimeout(resolve, 60));
    throttled();

    expect(callCount).toBe(2);
  });

  test('should pass arguments to throttled function', () => {
    let receivedArgs = null;
    const fn = (...args) => { receivedArgs = args; };
    const throttled = throttle(fn, 100);

    throttled('arg1', 'arg2');

    expect(receivedArgs).toEqual(['arg1', 'arg2']);
  });

  test('should execute throttled call after limit period expires', async () => {
    let callCount = 0;
    const fn = () => { callCount++; };
    const throttled = throttle(fn, 50);

    throttled(); // executed immediately
    throttled(); // within limit - ignored

    await new Promise(resolve => setTimeout(resolve, 60));

    // After limit period expires, throttled function executes again
    expect(callCount).toBe(2);
  });
});
