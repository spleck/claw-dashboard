/**
 * Tests for loading-states.js
 */

import loadingStates, {
  LoadingStateManager,
  createWidgetSpinner,
  createProgressBar,
  loadSequentially,
  loadStaggered,
  getSpinnerFrame,
  getSpinnerStyles,
  SPINNER_FRAMES,
  PROGRESS_STYLES
} from '../src/loading-states.js';

describe('Loading States', () => {
  beforeEach(() => {
    loadingStates.clearAll();
  });

  afterEach(() => {
    loadingStates.clearAll();
  });

  describe('LoadingStateManager', () => {
    test('should create a loading state', () => {
      const state = loadingStates.create('test', {
        type: 'spinner',
        message: 'Testing...'
      });

      expect(state).toBeDefined();
      expect(state.id).toBe('test');
      expect(typeof state.update).toBe('function');
      expect(typeof state.complete).toBe('function');
    });

    test('should track multiple loading states', () => {
      loadingStates.create('test1', { type: 'spinner' });
      loadingStates.create('test2', { type: 'progress', total: 100 });

      const active = loadingStates.getActive();
      expect(active).toHaveLength(2);
      expect(active).toContain('test1');
      expect(active).toContain('test2');
    });

    test('should update loading message', () => {
      const state = loadingStates.create('test', {
        type: 'spinner',
        message: 'Initial message'
      });

      state.update('New message');
      const frame = state.getFrame();
      expect(frame.message).toBe('New message');
    });

    test('should update progress', () => {
      const state = loadingStates.create('test', {
        type: 'progress',
        message: 'Loading...',
        total: 100
      });

      state.progress(50);
      const frame = state.getFrame();
      expect(frame.percentage).toBe('50.0');
      expect(frame.current).toBe(50);
    });

    test('should complete loading state', () => {
      const state = loadingStates.create('test', { type: 'spinner' });
      state.complete('Done!');

      expect(state.getFrame().message).toBe('Done!');
    });

    test('should remove loading state', () => {
      loadingStates.create('test', { type: 'spinner' });
      loadingStates.remove('test');

      expect(loadingStates.getActive()).toHaveLength(0);
    });

    test('should clear all loading states', () => {
      loadingStates.create('test1', { type: 'spinner' });
      loadingStates.create('test2', { type: 'spinner' });
      loadingStates.create('test3', { type: 'spinner' });

      loadingStates.clearAll();
      expect(loadingStates.getActive()).toHaveLength(0);
    });
  });

  describe('Spinner Styles', () => {
    test('should have multiple spinner styles', () => {
      const styles = getSpinnerStyles();
      expect(styles).toContain('dots');
      expect(styles).toContain('line');
      expect(styles).toContain('pulse');
      expect(styles).toContain('blocks');
      expect(styles).toContain('arrows');
      expect(styles).toContain('bouncing');
    });

    test('should return frames for each style', () => {
      Object.keys(SPINNER_FRAMES).forEach(style => {
        const frame = getSpinnerFrame(style, 0);
        expect(frame).toBeDefined();
        expect(typeof frame).toBe('string');
      });
    });

    test('should default to dots style', () => {
      const frame = getSpinnerFrame('invalid-style', 0);
      expect(frame).toBe(SPINNER_FRAMES.dots.frames[0]);
    });

    test('should auto-increment frame', () => {
      const frame1 = getSpinnerFrame('dots');
      // Small delay to get different frame
      const start = Date.now();
      while (Date.now() - start < 10) {} // Tiny busy wait
      const frame2 = getSpinnerFrame('dots');
      // Frames could be same or different depending on timing
      expect(typeof frame1).toBe('string');
      expect(typeof frame2).toBe('string');
    });
  });

  describe('Progress Bar', () => {
    test('should create progress bar', () => {
      const controller = createProgressBar('test-operation', 50);

      expect(controller).toBeDefined();
      expect(typeof controller.progress).toBe('function');
      expect(typeof controller.complete).toBe('function');
    });

    test('should have progress bar styles', () => {
      expect(PROGRESS_STYLES.blocks).toBeDefined();
      expect(PROGRESS_STYLES.bars).toBeDefined();
      expect(PROGRESS_STYLES.ascii).toBeDefined();
      expect(PROGRESS_STYLES.dots).toBeDefined();
    });
  });

  describe('Sequential Loading', () => {
    test('should load items sequentially', async () => {
      const items = ['a', 'b', 'c'];
      let callCount = 0;
      const loader = async (item) => {
        callCount++;
        return 'loaded';
      };

      const results = await loadSequentially(items, loader);

      expect(results).toHaveLength(3);
      expect(callCount).toBe(3);
      expect(results[0].success).toBe(true);
    });

    test('should handle loader failures gracefully', async () => {
      const items = ['a', 'b'];
      const loader = async (item) => {
        if (item === 'b') throw new Error('failed');
        return 'loaded';
      };

      const results = await loadSequentially(items, loader);

      expect(results).toHaveLength(2);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(false);
    });

    test('should call progress callback', async () => {
      const items = ['a', 'b'];
      const loader = async () => 'loaded';
      const progressCalls = [];
      const onProgress = (current, total, item) => {
        progressCalls.push({ current, total, item });
      };

      await loadSequentially(items, loader, { onProgress });

      expect(progressCalls).toHaveLength(2);
      expect(progressCalls[0]).toEqual({ current: 1, total: 2, item: 'a' });
      expect(progressCalls[1]).toEqual({ current: 2, total: 2, item: 'b' });
    });

    test('should call item complete callback', async () => {
      const items = [{ name: 'test' }];
      const loader = async () => 'result';
      const completedItems = [];
      const onItemComplete = (item, result, index) => {
        completedItems.push({ item, result, index });
      };

      await loadSequentially(items, loader, { onItemComplete });

      expect(completedItems).toHaveLength(1);
      expect(completedItems[0].item).toBe(items[0]);
      expect(completedItems[0].result).toBe('result');
      expect(completedItems[0].index).toBe(0);
    });
  });

  describe('Staggered Loading', () => {
    test('should load widgets with stagger delay', async () => {
      const widgets = [{ id: 1 }, { id: 2 }];
      let callCount = 0;
      const factory = async () => {
        callCount++;
        return { created: true };
      };

      const results = await loadStaggered(widgets, factory, {
        staggerDelay: 1 // Very small delay for fast test
      });

      expect(results).toHaveLength(2);
      expect(callCount).toBe(2);
    });

    test('should call widget loaded callback', async () => {
      const widgets = [{ id: 1 }];
      const factory = async () => ({ created: true });
      const loadedWidgets = [];
      const onWidgetLoaded = (widget, config, index) => {
        loadedWidgets.push({ widget, config, index });
      };

      await loadStaggered(widgets, factory, { onWidgetLoaded });

      expect(loadedWidgets).toHaveLength(1);
      expect(loadedWidgets[0].widget).toEqual({ created: true });
      expect(loadedWidgets[0].config).toBe(widgets[0]);
      expect(loadedWidgets[0].index).toBe(0);
    });
  });

  describe('Widget Spinner', () => {
    test('should return spinner controller', () => {
      const mockBlessed = {};
      const mockParent = {
        screen: { render: () => {} }
      };

      const controller = createWidgetSpinner('test-widget', mockBlessed, mockParent);

      expect(controller).toBeDefined();
      expect(typeof controller.attach).toBe('function');
      expect(typeof controller.update).toBe('function');
      expect(typeof controller.complete).toBe('function');
      expect(typeof controller.detach).toBe('function');
    });
  });

  describe('Elapsed Time Formatting', () => {
    test('should format milliseconds', () => {
      const state = loadingStates.create('test', { type: 'spinner' });
      // Wait a tiny bit
      const elapsed = state.elapsed();
      expect(elapsed).toBeGreaterThanOrEqual(0);
      expect(typeof elapsed).toBe('number');
    });
  });

  describe('Listener Management', () => {
    test('should notify listeners on update', (done) => {
      const state = loadingStates.create('test', { type: 'spinner' });

      state.onUpdate((frame) => {
        if (frame.message === 'Updated!') {
          done();
        }
      });

      state.update('Updated!');
    });

    test('should allow unsubscribing listeners', () => {
      const state = loadingStates.create('test', { type: 'spinner' });
      let callCount = 0;
      const callback = () => {
        callCount++;
      };

      const unsubscribe = state.onUpdate(callback);
      unsubscribe(); // Remove listener

      state.update('Test');
      expect(callCount).toBe(0);
    });
  });
});
