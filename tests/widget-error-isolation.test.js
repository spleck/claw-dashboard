/**
 * Unit tests for widget error isolation
 */

import {
  WidgetErrorIsolator,
  WidgetHealthTracker,
  WidgetIsolatedError,
  WidgetHealthStatus,
  WidgetErrorType,
  executeWithIsolation,
  getWidgetErrorIsolator,
  DEFAULT_ISOLATION_CONFIG,
} from '../src/widgets/widget-error-isolation.js';

// Helper to create a simple mock function
function createMockFn(returnValue) {
  let callCount = 0;
  const fn = (...args) => {
    callCount++;
    fn.calls.push(args);
    return Promise.resolve(returnValue);
  };
  fn.calls = [];
  fn.mockClear = () => { fn.calls = []; callCount = 0; };
  fn.mockResolvedValue = (val) => {
    const newFn = createMockFn(val);
    return newFn;
  };
  fn.mockRejectedValue = (err) => {
    const newFn = (...args) => {
      callCount++;
      fn.calls.push(args);
      return Promise.reject(err);
    };
    newFn.calls = fn.calls;
    return newFn;
  };
  return fn;
}

describe('Widget Error Isolation', () => {

  describe('WidgetHealthTracker', () => {
    let tracker;

    beforeEach(() => {
      tracker = new WidgetHealthTracker();
    });

    describe('recordSuccess', () => {
      test('should mark widget as healthy on success', () => {
        tracker.recordSuccess('test-widget');
        const health = tracker.getHealth('test-widget');

        expect(health.status).toBe(WidgetHealthStatus.HEALTHY);
        expect(health.consecutiveErrors).toBe(0);
        expect(health.isHealthy).toBe(true);
      });

      test('should reset consecutive errors on success', () => {
        tracker.recordError('test-widget', new Error('Test error'));
        tracker.recordSuccess('test-widget');
        const health = tracker.getHealth('test-widget');

        expect(health.consecutiveErrors).toBe(0);
      });
    });

    describe('recordError', () => {
      test('should track consecutive errors', () => {
        tracker.recordError('test-widget', new Error('Error 1'));
        tracker.recordError('test-widget', new Error('Error 2'));

        const health = tracker.getHealth('test-widget');
        expect(health.consecutiveErrors).toBe(2);
        expect(health.totalErrors).toBe(2);
      });

      test('should mark widget as degraded after first error', () => {
        tracker.recordError('test-widget', new Error('Test error'));
        const health = tracker.getHealth('test-widget');

        expect(health.status).toBe(WidgetHealthStatus.DEGRADED);
        expect(health.isHealthy).toBe(false);
        expect(health.isOperational).toBe(true);
      });

      test('should mark widget as failed after max consecutive errors', () => {
        const maxErrors = DEFAULT_ISOLATION_CONFIG.maxConsecutiveErrors;

        for (let i = 0; i < maxErrors; i++) {
          tracker.recordError('test-widget', new Error(`Error ${i}`));
        }

        const health = tracker.getHealth('test-widget');
        expect(health.status).toBe(WidgetHealthStatus.FAILED);
        expect(health.isOperational).toBe(false);
      });

      test('should store error details', () => {
        const error = new Error('Test error message');
        error.stack = 'Test stack trace';

        tracker.recordError('test-widget', error, WidgetErrorType.RENDER_ERROR);
        const health = tracker.getHealth('test-widget');

        expect(health.lastError.message).toBe('Test error message');
        expect(health.lastError.type).toBe(WidgetErrorType.RENDER_ERROR);
        expect(health.lastError.stack).toBe('Test stack trace');
        expect(health.lastError.timestamp).toBeDefined();
      });

      test('should track error history within window', () => {
        tracker.recordError('test-widget', new Error('Error 1'));
        tracker.recordError('test-widget', new Error('Error 2'));

        const health = tracker.getHealth('test-widget');
        expect(health.recentErrorCount).toBe(2);
      });
    });

    describe('getHealth', () => {
      test('should return null for untracked widget', () => {
        const health = tracker.getHealth('unknown-widget');
        expect(health).toBeNull();
      });

      test('should include computed properties', () => {
        tracker.recordSuccess('test-widget');
        const health = tracker.getHealth('test-widget');

        expect(health).toHaveProperty('isHealthy');
        expect(health).toHaveProperty('isOperational');
        expect(health).toHaveProperty('recentErrorCount');
      });
    });

    describe('getAllHealth', () => {
      test('should return health for all tracked widgets', () => {
        tracker.recordSuccess('widget-1');
        tracker.recordSuccess('widget-2');

        const allHealth = tracker.getAllHealth();
        expect(Object.keys(allHealth)).toHaveLength(2);
        expect(allHealth['widget-1']).toBeDefined();
        expect(allHealth['widget-2']).toBeDefined();
      });
    });

    describe('canRecover', () => {
      test('should allow recovery for degraded widget', () => {
        tracker.recordError('test-widget', new Error('Error'));
        expect(tracker.canRecover('test-widget')).toBe(true);
      });

      test('should allow recovery for failed widget after delay', () => {
        tracker.config.recoveryDelayMs = 1000;
        tracker.recordError('test-widget', new Error('Error 1'));
        tracker.recordError('test-widget', new Error('Error 2'));
        tracker.recordError('test-widget', new Error('Error 3'));

        // Initially should not allow recovery
        expect(tracker.canRecover('test-widget')).toBe(false);

        // After waiting, should allow recovery
        tracker.healthStatus.get('test-widget').failedSince = Date.now() - 2000;
        expect(tracker.canRecover('test-widget')).toBe(true);
      });

      test('should not allow recovery when autoRecover is disabled', () => {
        tracker.config.autoRecover = false;
        tracker.recordError('test-widget', new Error('Error'));
        expect(tracker.canRecover('test-widget')).toBe(false);
      });

      test('should not allow recovery after max attempts', () => {
        tracker.config.maxRecoveryAttempts = 2;

        tracker.markRecovering('test-widget');
        tracker.markRecovering('test-widget');
        tracker.markRecovering('test-widget');

        expect(tracker.canRecover('test-widget')).toBe(false);
      });
    });

    describe('resetHealth', () => {
      test('should clear health record', () => {
        tracker.recordError('test-widget', new Error('Error'));
        tracker.resetHealth('test-widget');

        const health = tracker.getHealth('test-widget');
        expect(health).toBeNull();
      });
    });

    describe('getStats', () => {
      test('should return summary statistics', () => {
        tracker.recordSuccess('widget-1');
        tracker.recordSuccess('widget-2');
        tracker.recordError('widget-2', new Error('Error'));
        tracker.recordError('widget-3', new Error('Error 1'));
        tracker.recordError('widget-3', new Error('Error 2'));
        tracker.recordError('widget-3', new Error('Error 3'));

        const stats = tracker.getStats();
        expect(stats.total).toBe(3);
        expect(stats.healthy).toBe(1);
        expect(stats.degraded).toBe(1);
        expect(stats.failed).toBe(1);
        expect(stats.totalErrors).toBe(4);
      });
    });
  });

  describe('WidgetErrorIsolator', () => {
    let isolator;

    beforeEach(() => {
      isolator = new WidgetErrorIsolator({
        failSilently: true,
        logErrors: false,
      });
    });

    afterEach(() => {
      isolator.shutdown();
    });

    describe('wrapInit', () => {
      test('should wrap successful init', async () => {
        const initFn = () => Promise.resolve({ initialized: true });
        const result = await isolator.wrapInit('test-widget', initFn);

        expect(result).toEqual({ initialized: true });
      });

      test('should catch init errors when failSilently is true', async () => {
        const initFn = () => Promise.reject(new Error('Init failed'));
        const result = await isolator.wrapInit('test-widget', initFn);

        expect(result).toBeNull();
      });

      test('should throw when failSilently is false', async () => {
        isolator.config.failSilently = false;
        const initFn = () => Promise.reject(new Error('Init failed'));

        await expect(isolator.wrapInit('test-widget', initFn)).rejects.toThrow(WidgetIsolatedError);
      });

      test('should mark widget as healthy after successful init', async () => {
        const initFn = () => Promise.resolve({ initialized: true });
        await isolator.wrapInit('test-widget', initFn);

        const health = isolator.getHealth('test-widget');
        expect(health.status).toBe(WidgetHealthStatus.HEALTHY);
      });
    });

    describe('wrapCreate', () => {
      test('should wrap successful create', async () => {
        const createFn = () => Promise.resolve({ created: true });
        const result = await isolator.wrapCreate('test-widget', createFn);

        expect(result).toEqual({ created: true });
      });

      test('should catch create errors', async () => {
        const createFn = () => Promise.reject(new Error('Create failed'));
        const result = await isolator.wrapCreate('test-widget', createFn);

        expect(result).toBeNull();
      });
    });

    describe('wrapGetData', () => {
      test('should wrap successful data fetch', async () => {
        const dataFn = () => Promise.resolve({ data: 'test' });
        const result = await isolator.wrapGetData('test-widget', dataFn);

        expect(result).toEqual({ data: 'test' });
      });

      test('should catch data fetch errors', async () => {
        const dataFn = () => Promise.reject(new Error('Data fetch failed'));
        const result = await isolator.wrapGetData('test-widget', dataFn);

        expect(result).toBeNull();
      });
    });

    describe('wrapRender', () => {
      test('should wrap successful render', async () => {
        const renderFn = () => Promise.resolve(undefined);
        const result = await isolator.wrapRender('test-widget', renderFn);

        expect(result).toBeUndefined();
      });

      test('should catch render errors', async () => {
        const renderFn = () => Promise.reject(new Error('Render failed'));
        const result = await isolator.wrapRender('test-widget', renderFn);

        expect(result).toBeNull();
      });
    });

    describe('wrapDestroy', () => {
      test('should wrap successful destroy', async () => {
        const destroyFn = () => Promise.resolve(undefined);
        const result = await isolator.wrapDestroy('test-widget', destroyFn);

        expect(result).toBeUndefined();
      });

      test('should catch destroy errors', async () => {
        const destroyFn = () => Promise.reject(new Error('Destroy failed'));
        const result = await isolator.wrapDestroy('test-widget', destroyFn);

        expect(result).toBeNull();
      });
    });

    describe('timeout handling', () => {
      test('should timeout slow operations', async () => {
        isolator.config.initTimeoutMs = 50;

        const slowFn = () =>
          new Promise((resolve) => setTimeout(() => resolve('done'), 200));

        const startTime = Date.now();
        const result = await isolator.wrapInit('test-widget', slowFn);
        const elapsed = Date.now() - startTime;

        expect(result).toBeNull();
        expect(elapsed).toBeLessThan(150); // Should timeout before 200ms
      });
    });

    describe('isOperational', () => {
      test('should return true for new widgets', () => {
        expect(isolator.isOperational('new-widget')).toBe(true);
      });

      test('should return false for failed widgets', async () => {
        const errorFn = () => Promise.reject(new Error('Error'));

        // Trigger failures
        for (let i = 0; i < DEFAULT_ISOLATION_CONFIG.maxConsecutiveErrors; i++) {
          await isolator.wrapRender('test-widget', errorFn);
        }

        expect(isolator.isOperational('test-widget')).toBe(false);
      });
    });

    describe('resetWidget', () => {
      test('should reset widget health', async () => {
        const errorFn = () => Promise.reject(new Error('Error'));
        await isolator.wrapRender('test-widget', errorFn);

        isolator.resetWidget('test-widget');

        const health = isolator.getHealth('test-widget');
        expect(health).toBeNull();
        expect(isolator.isOperational('test-widget')).toBe(true);
      });
    });

    describe('getStats', () => {
      test('should return isolator statistics', () => {
        const stats = isolator.getStats();

        expect(stats).toHaveProperty('total');
        expect(stats).toHaveProperty('healthy');
        expect(stats).toHaveProperty('degraded');
        expect(stats).toHaveProperty('failed');
        expect(stats).toHaveProperty('failedWidgetCount');
        expect(stats).toHaveProperty('pendingRecoveries');
      });
    });
  });

  describe('WidgetIsolatedError', () => {
    test('should create error with correct properties', () => {
      const originalError = new Error('Original error');
      const error = new WidgetIsolatedError(
        'test-widget',
        'render',
        originalError,
        WidgetErrorType.RENDER_ERROR
      );

      expect(error.widgetId).toBe('test-widget');
      expect(error.operation).toBe('render');
      expect(error.errorType).toBe(WidgetErrorType.RENDER_ERROR);
      expect(error.originalError).toBe(originalError);
      expect(error.message).toContain('test-widget');
      expect(error.message).toContain('render');
      expect(error.code).toBe('WIDGET_ISOLATED_ERROR');
    });

    test('should handle null original error', () => {
      const error = new WidgetIsolatedError('test-widget', 'init', null);

      expect(error.originalError).toBeNull();
      expect(error.message).toContain('Unknown error');
    });
  });

  describe('executeWithIsolation', () => {
    test('should execute multiple operations with isolation', async () => {
      const operations = [
        {
          widgetId: 'widget-1',
          operation: () => Promise.resolve('result-1'),
        },
        {
          widgetId: 'widget-2',
          operation: () => Promise.reject(new Error('Failed')),
        },
        {
          widgetId: 'widget-3',
          operation: () => Promise.resolve('result-3'),
        },
      ];

      const results = await executeWithIsolation(operations, { failSilently: true });

      expect(results).toHaveLength(3);
      expect(results[0].success).toBe(true);
      expect(results[0].result).toBe('result-1');
      expect(results[1].success).toBe(false);
      expect(results[1].error).toBeDefined();
      expect(results[2].success).toBe(true);
      expect(results[2].result).toBe('result-3');
    });

    test('should allow partial success', async () => {
      const operations = [
        { widgetId: 'widget-1', operation: () => Promise.resolve('ok') },
        { widgetId: 'widget-2', operation: () => Promise.reject(new Error('fail')) },
      ];

      const results = await executeWithIsolation(operations);

      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(false);
    });
  });

  describe('getWidgetErrorIsolator', () => {
    test('should return singleton instance', () => {
      const isolator1 = getWidgetErrorIsolator();
      const isolator2 = getWidgetErrorIsolator();

      expect(isolator1).toBe(isolator2);
    });

    test('should create instance if not exists', () => {
      const isolator = getWidgetErrorIsolator({ failSilently: false });

      expect(isolator).toBeInstanceOf(WidgetErrorIsolator);
      // Note: singleton may retain previous config
    });
  });
});
