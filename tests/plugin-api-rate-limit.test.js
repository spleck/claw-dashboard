/**
 * Tests for Plugin API rate limiting
 */

import { jest } from '@jest/globals';
import { PluginAPI, BaseWidget } from '../src/widgets/plugin-api.js';

describe('PluginAPI Rate Limiting', () => {
  let api;

  beforeEach(() => {
    api = new PluginAPI({
      rateLimit: {
        enabled: true,
        windowMs: 60000,
        maxCalls: 5,
        alwaysAllowCritical: false
      }
    });
  });

  afterEach(() => {
    api.rateLimiter.reset();
  });

  describe('Constructor', () => {
    test('should create API with default rate limit config', () => {
      const defaultApi = new PluginAPI();
      const status = defaultApi.getRateLimitStatus();

      expect(status.enabled).toBe(true);
      expect(status.windowMs).toBe(60000);
      expect(status.maxAlerts).toBe(100);
    });

    test('should create API with custom rate limit config', () => {
      const customApi = new PluginAPI({
        rateLimit: {
          enabled: true,
          windowMs: 30000,
          maxCalls: 10,
          alwaysAllowCritical: true
        }
      });
      const status = customApi.getRateLimitStatus();

      expect(status.enabled).toBe(true);
      expect(status.windowMs).toBe(30000);
      expect(status.maxAlerts).toBe(10);
      expect(status.alwaysAllowCritical).toBe(true);
    });

    test('should allow disabling rate limiting', () => {
      const unlimitedApi = new PluginAPI({
        rateLimit: { enabled: false }
      });
      const status = unlimitedApi.getRateLimitStatus();

      expect(status.enabled).toBe(false);
    });
  });

  describe('getData rate limiting', () => {
    test('should allow calls under limit', async () => {
      api.registerDataProvider('test', async () => ({ data: 'test' }));

      const result = await api.getData('test');
      expect(result).toEqual({ data: 'test' });
    });

    test('should block calls over limit', async () => {
      api.registerDataProvider('test', async () => ({ data: 'test' }));

      // Make maxCalls calls
      for (let i = 0; i < 5; i++) {
        await api.getData('test');
      }

      // Next call should be rate limited
      await expect(api.getData('test')).rejects.toThrow('Rate limit exceeded');
    });

    test('should include retryAfter in rate limit error', async () => {
      api.registerDataProvider('test', async () => ({ data: 'test' }));

      // Exhaust limit
      for (let i = 0; i < 5; i++) {
        await api.getData('test');
      }

      try {
        await api.getData('test');
        fail('Should have thrown');
      } catch (err) {
        expect(err.code).toBe('RATE_LIMIT_EXCEEDED');
        expect(err.retryAfter).toBeDefined();
        expect(err.retryAfter).toBeGreaterThan(0);
      }
    });

    test('should not rate limit when disabled', async () => {
      const unlimitedApi = new PluginAPI({
        rateLimit: { enabled: false, maxCalls: 1 }
      });
      unlimitedApi.registerDataProvider('test', async () => ({ data: 'test' }));

      // Should allow unlimited calls
      for (let i = 0; i < 10; i++) {
        const result = await unlimitedApi.getData('test');
        expect(result).toEqual({ data: 'test' });
      }
    });

    test('should track getData category separately', async () => {
      api.registerDataProvider('test', async () => ({ data: 'test' }));

      // Make calls
      await api.getData('test');

      const status = api.getRateLimitStatus();
      expect(status.types.getData).toBeDefined();
      expect(status.types.getData.current).toBe(1);
    });
  });

  describe('executeExtension rate limiting', () => {
    test('should allow extension calls under limit', async () => {
      api.registerExtensionPoint('test-extension', { multiple: true });
      api.extend('test-extension', async () => 'result');

      const results = await api.executeExtension('test-extension');
      expect(results).toHaveLength(1);
      expect(results[0].result).toBe('result');
    });

    test('should block extension calls over limit', async () => {
      api.registerExtensionPoint('test-extension', { multiple: true });
      api.extend('test-extension', async () => 'result');

      // Make maxCalls calls
      for (let i = 0; i < 5; i++) {
        await api.executeExtension('test-extension');
      }

      // Next call should be rate limited
      await expect(api.executeExtension('test-extension')).rejects.toThrow('Rate limit exceeded');
    });

    test('should track executeExtension category separately', async () => {
      api.registerExtensionPoint('test-extension', { multiple: true });
      api.extend('test-extension', async () => 'result');

      await api.executeExtension('test-extension');

      const status = api.getRateLimitStatus();
      expect(status.types.executeExtension).toBeDefined();
      expect(status.types.executeExtension.current).toBe(1);
    });
  });

  describe('getMetrics rate limiting', () => {
    test('should allow metrics calls under limit', async () => {
      const dataProvider = jest.fn().mockResolvedValue({ cpu: 50 });
      const metricsApi = new PluginAPI({
        dataProvider,
        rateLimit: { enabled: true, maxCalls: 5 }
      });

      const result = await metricsApi.getMetrics('cpu');
      expect(result).toEqual({ cpu: 50 });
    });

    test('should block metrics calls over limit', async () => {
      const dataProvider = jest.fn().mockResolvedValue({ cpu: 50 });
      const metricsApi = new PluginAPI({
        dataProvider,
        rateLimit: { enabled: true, maxCalls: 5 }
      });

      // Make maxCalls calls
      for (let i = 0; i < 5; i++) {
        await metricsApi.getMetrics('cpu');
      }

      // Next call should be rate limited
      await expect(metricsApi.getMetrics('cpu')).rejects.toThrow('Rate limit exceeded');
    });

    test('should track getMetrics category separately', async () => {
      const dataProvider = jest.fn().mockResolvedValue({ cpu: 50 });
      const metricsApi = new PluginAPI({
        dataProvider,
        rateLimit: { enabled: true, maxCalls: 5 }
      });

      await metricsApi.getMetrics('cpu');

      const status = metricsApi.getRateLimitStatus();
      expect(status.types.getMetrics).toBeDefined();
      expect(status.types.getMetrics.current).toBe(1);
    });
  });

  describe('Rate limit configuration', () => {
    test('should allow runtime configuration', () => {
      api.configureRateLimit({ maxCalls: 20 });

      const status = api.getRateLimitStatus();
      expect(status.maxAlerts).toBe(20);
    });

    test('should allow disabling at runtime', () => {
      api.configureRateLimit({ enabled: false });

      const status = api.getRateLimitStatus();
      expect(status.enabled).toBe(false);
    });

    test('should get rate limiter instance for custom use', () => {
      const limiter = api.getRateLimiter();

      expect(limiter).toBeDefined();
      expect(typeof limiter.check).toBe('function');
      expect(typeof limiter.checkAndRecord).toBe('function');
    });
  });

  describe('Independent category tracking', () => {
    test('should track getData and executeExtension independently', async () => {
      api.registerDataProvider('test', async () => ({ data: 'test' }));
      api.registerExtensionPoint('test-ext', { multiple: true });
      api.extend('test-ext', async () => 'result');

      // Fill up getData limit
      for (let i = 0; i < 5; i++) {
        await api.getData('test');
      }

      // executeExtension should still be allowed
      const results = await api.executeExtension('test-ext');
      expect(results).toHaveLength(1);

      const status = api.getRateLimitStatus();
      expect(status.types.getData.current).toBe(5);
      expect(status.types.executeExtension.current).toBe(1);
    });

    test('should track getMetrics independently from getData', async () => {
      const dataProvider = jest.fn().mockResolvedValue({ cpu: 50 });
      const metricsApi = new PluginAPI({
        dataProvider,
        rateLimit: { enabled: true, maxCalls: 5 }
      });
      metricsApi.registerDataProvider('test', async () => ({ data: 'test' }));

      // Fill up getMetrics limit
      for (let i = 0; i < 5; i++) {
        await metricsApi.getMetrics('cpu');
      }

      // getData should still be allowed
      await metricsApi.getData('test');

      const status = metricsApi.getRateLimitStatus();
      expect(status.types.getMetrics.current).toBe(5);
      expect(status.types.getData.current).toBe(1);
    });
  });

  describe('Integration with BaseWidget', () => {
    test('should provide rate limiter to widgets via API', async () => {
      class TestWidget extends BaseWidget {
        constructor(options) {
          super(options);
        }
      }

      const widget = new TestWidget({ api });
      const limiter = widget.api.getRateLimiter();

      expect(limiter).toBeDefined();
    });

    test('widgets can configure rate limits', async () => {
      class TestWidget extends BaseWidget {
        constructor(options) {
          super(options);
        }

        configureApiRateLimit() {
          this.api.configureRateLimit({ maxCalls: 50 });
        }
      }

      const widget = new TestWidget({ api });
      widget.configureApiRateLimit();

      const status = widget.api.getRateLimitStatus();
      expect(status.maxAlerts).toBe(50);
    });
  });
});