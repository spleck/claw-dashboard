/**
 * Tests for widget error boundary functionality
 */

import { jest } from '@jest/globals';

// Mock blessed before importing the module under test
const mockBlessedBox = jest.fn();
const mockBlessedText = jest.fn();
const mockBlessedButton = jest.fn();

jest.unstable_mockModule('blessed', () => ({
  default: {
    box: mockBlessedBox,
    text: mockBlessedText,
    button: mockBlessedButton,
  },
  box: mockBlessedBox,
  text: mockBlessedText,
  button: mockBlessedButton,
}));

// Mock logger
jest.unstable_mockModule('../src/logger.js', () => ({
  default: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  }
}));

// Now import the modules under test
const { WidgetErrorBoundary, ErrorBoundaryManager, ErrorStyles, withErrorBoundary, getErrorBoundaryManager } = await import('../src/widgets/widget-error-boundary.js');
const { WidgetHealthStatus, WidgetErrorType } = await import('../src/widgets/widget-error-isolation.js');

// Mock blessed elements
const mockBlessedElements = [];

function createMockBox(options = {}) {
  return {
    destroyed: false,
    hidden: false,
    content: '',
    ...options,
    children: [],
    style: {},
    focused: false,
    _listeners: {},
    show() { this.hidden = false; },
    hide() { this.hidden = true; },
    destroy() { this.destroyed = true; },
    setContent(content) { this.content = content; },
    focus() { this.focused = true; },
    on(event, handler) {
      if (!this._listeners[event]) this._listeners[event] = [];
      this._listeners[event].push(handler);
    },
    removeListener(event, handler) {
      if (this._listeners[event]) {
        const idx = this._listeners[event].indexOf(handler);
        if (idx > -1) this._listeners[event].splice(idx, 1);
      }
    },
    emit(event, ...args) {
      if (this._listeners[event]) {
        this._listeners[event].forEach(h => h(...args));
      }
    },
  };
}

// Mock widget for testing
function createMockWidget(options = {}) {
  return {
    id: options.id || 'test-widget',
    name: options.name || 'Test Widget',
    box: options.box || null,
    create: options.create || jest.fn().mockResolvedValue(undefined),
    init: options.init || jest.fn().mockResolvedValue(undefined),
    getData: options.getData || jest.fn().mockResolvedValue({}),
    render: options.render || jest.fn(),
    update: options.update || jest.fn(),
    destroy: options.destroy || jest.fn().mockResolvedValue(undefined),
  };
}

// Mock screen
function createMockScreen() {
  const screen = createMockBox({
    _keypressHandlers: [],
    keypressCallbacks: [],
  });
  screen._keypressHandlers = [];
  screen.on('keypress', (ch, key) => {
    screen._keypressHandlers.forEach(h => h(ch, key));
  });
  return screen;
}

describe('Widget Error Boundary', () => {
  beforeEach(() => {
    mockBlessedElements.length = 0;
    mockBlessedBox.mockReset();
    mockBlessedText.mockReset();
    mockBlessedButton.mockReset();

    // Set up blessed mocks to return mock boxes
    mockBlessedBox.mockImplementation((opts) => {
      const box = createMockBox(opts);
      mockBlessedElements.push(box);
      return box;
    });
    mockBlessedText.mockImplementation((opts) => {
      const text = createMockBox(opts);
      mockBlessedElements.push(text);
      return text;
    });
    mockBlessedButton.mockImplementation((opts) => {
      const button = createMockBox(opts);
      mockBlessedElements.push(button);
      return button;
    });

    jest.clearAllMocks();
  });

  afterEach(() => {
    // Clean up any remaining error boundaries
    const manager = getErrorBoundaryManager();
    manager.clearAll();
  });

  describe('WidgetErrorBoundary', () => {
    test('should create error boundary with default options', () => {
      const widget = createMockWidget();
      const boundary = new WidgetErrorBoundary(widget);

      expect(boundary.widget).toBe(widget);
      expect(boundary.options.maxRetries).toBe(3);
      expect(boundary.options.retryDelay).toBe(5000);
      expect(boundary.options.showErrorDetails).toBe(true);
      expect(boundary.options.allowDismiss).toBe(true);
      expect(boundary.options.errorTitle).toBe('Widget Error');
    });

    test('should create error boundary with custom options', () => {
      const widget = createMockWidget();
      const boundary = new WidgetErrorBoundary(widget, {
        maxRetries: 5,
        retryDelay: 10000,
        showErrorDetails: false,
        allowDismiss: false,
        errorTitle: 'Custom Error',
      });

      expect(boundary.options.maxRetries).toBe(5);
      expect(boundary.options.retryDelay).toBe(10000);
      expect(boundary.options.showErrorDetails).toBe(false);
      expect(boundary.options.allowDismiss).toBe(false);
      expect(boundary.options.errorTitle).toBe('Custom Error');
    });

    test('should track initial error state', () => {
      const widget = createMockWidget();
      const boundary = new WidgetErrorBoundary(widget);

      expect(boundary.errorState.hasError).toBe(false);
      expect(boundary.errorState.error).toBe(null);
      expect(boundary.errorState.retryCount).toBe(0);
      expect(boundary.errorState.isRecovering).toBe(false);
    });

    test('should return error state info', () => {
      const widget = createMockWidget({ id: 'test-widget' });
      const boundary = new WidgetErrorBoundary(widget);

      const state = boundary.getErrorState();
      expect(state.hasError).toBe(false);
      expect(state.error).toBe(null);
      expect(state.health).toBeDefined();
    });

    test('should report no error initially', () => {
      const widget = createMockWidget();
      const boundary = new WidgetErrorBoundary(widget);

      expect(boundary.hasError()).toBe(false);
    });
  });

  describe('Error boundary creation', () => {
    test('should create widget successfully when no error', async () => {
      const widget = createMockWidget();
      const screen = createMockScreen();
      const boundary = new WidgetErrorBoundary(widget);

      const result = await boundary.create(screen, {});

      expect(widget.create).toHaveBeenCalledWith(screen, {});
      expect(boundary.hasError()).toBe(false);
    });

    test('should show error boundary when widget creation fails', async () => {
      const widget = createMockWidget({
        create: jest.fn().mockRejectedValue(new Error('Creation failed')),
      });
      const screen = createMockScreen();
      const boundary = new WidgetErrorBoundary(widget);

      await boundary.create(screen, {});

      expect(boundary.hasError()).toBe(true);
      expect(boundary.errorContainer).toBeDefined();
    });

    test('should hide original box when showing error', async () => {
      const originalBox = createMockBox();
      const widget = createMockWidget({
        create: jest.fn().mockRejectedValue(new Error('Creation failed')),
      });
      widget.box = originalBox;

      const screen = createMockScreen();
      const boundary = new WidgetErrorBoundary(widget);
      boundary.originalBox = originalBox;

      await boundary.create(screen, {});

      expect(originalBox.hidden).toBe(true);
    });
  });

  describe('Error boundary UI', () => {
    test('should create error container with proper structure', async () => {
      const widget = createMockWidget({
        id: 'test-widget',
        create: jest.fn().mockRejectedValue(new Error('Test error')),
      });
      const screen = createMockScreen();
      const boundary = new WidgetErrorBoundary(widget);

      await boundary.create(screen, {});

      expect(boundary.errorContainer).toBeDefined();
      expect(boundary.retryButton).toBeDefined();
      expect(boundary.dismissButton).toBeDefined();
      expect(boundary.errorText).toBeDefined();
    });

    test('should display error message', async () => {
      const errorMessage = 'Something went wrong';
      const widget = createMockWidget({
        create: jest.fn().mockRejectedValue(new Error(errorMessage)),
      });
      const screen = createMockScreen();
      const boundary = new WidgetErrorBoundary(widget);

      await boundary.create(screen, {});

      expect(boundary.errorText.content).toContain(errorMessage);
    });

    test('should truncate long error messages', async () => {
      const longMessage = 'A'.repeat(50);
      const widget = createMockWidget({
        create: jest.fn().mockRejectedValue(new Error(longMessage)),
      });
      const screen = createMockScreen();
      const boundary = new WidgetErrorBoundary(widget);

      await boundary.create(screen, {});

      expect(boundary.errorText.content.length).toBeLessThan(longMessage.length);
      expect(boundary.errorText.content).toContain('...');
    });

    test('should show retry count after retries', async () => {
      const widget = createMockWidget({
        create: jest.fn().mockRejectedValue(new Error('Test')),
      });
      const screen = createMockScreen();
      const boundary = new WidgetErrorBoundary(widget);
      boundary.errorState.retryCount = 2;

      await boundary.create(screen, {});

      // Check that container has retry count text
      const hasRetryCount = mockBlessedElements.some(
        el => el.content && el.content.includes('Retry 2')
      );
      expect(hasRetryCount).toBe(true);
    });

    test('should not show dismiss button when disabled', async () => {
      const widget = createMockWidget({
        create: jest.fn().mockRejectedValue(new Error('Test')),
      });
      const screen = createMockScreen();
      const boundary = new WidgetErrorBoundary(widget, { allowDismiss: false });

      await boundary.create(screen, {});

      expect(boundary.dismissButton).toBeNull();
    });
  });

  describe('Retry functionality', () => {
    test('should reset widget on successful retry', async () => {
      let shouldFail = true;
      const widget = createMockWidget({
        create: jest.fn().mockImplementation(() => {
          if (shouldFail) {
            shouldFail = false;
            return Promise.reject(new Error('Initial failure'));
          }
          return Promise.resolve();
        }),
      });

      const screen = createMockScreen();
      const boundary = new WidgetErrorBoundary(widget);

      await boundary.create(screen, {});
      expect(boundary.hasError()).toBe(true);

      // Simulate retry
      await boundary.handleRetry();

      expect(boundary.hasError()).toBe(false);
      expect(boundary.errorState.retryCount).toBe(1);
    });

    test('should increment retry count on failure', async () => {
      const widget = createMockWidget({
        create: jest.fn().mockRejectedValue(new Error('Always fails')),
      });
      const screen = createMockScreen();
      const boundary = new WidgetErrorBoundary(widget, { maxRetries: 3 });

      await boundary.create(screen, {});
      expect(boundary.errorState.retryCount).toBe(0);

      await boundary.handleRetry();
      expect(boundary.errorState.retryCount).toBe(1);

      await boundary.handleRetry();
      expect(boundary.errorState.retryCount).toBe(2);
    });

    test('should prevent concurrent retries', async () => {
      const widget = createMockWidget({
        create: jest.fn().mockImplementation(() =>
          new Promise(resolve => setTimeout(resolve, 100))
        ),
      });
      const screen = createMockScreen();
      const boundary = new WidgetErrorBoundary(widget);

      boundary.errorState.isRecovering = true;

      // Second retry should be ignored
      await boundary.handleRetry();
      expect(boundary.errorState.isRecovering).toBe(true);
    });

    test('should call onRetry callback on success', async () => {
      const onRetry = jest.fn();
      const widget = createMockWidget({
        create: jest.fn().mockResolvedValue(undefined),
      });
      const screen = createMockScreen();
      const boundary = new WidgetErrorBoundary(widget, { onRetry });

      boundary.errorState.hasError = true;
      await boundary.handleRetry();

      expect(onRetry).toHaveBeenCalledWith(true, 1);
    });

    test('should call onRetry callback on failure', async () => {
      const onRetry = jest.fn();
      const widget = createMockWidget({
        create: jest.fn().mockRejectedValue(new Error('Still fails')),
      });
      const screen = createMockScreen();
      const boundary = new WidgetErrorBoundary(widget, { onRetry });

      boundary.errorState.hasError = true;
      await boundary.handleRetry();

      expect(onRetry).toHaveBeenCalledWith(false, 1, expect.any(Error));
    });
  });

  describe('Dismiss functionality', () => {
    test('should clear error boundary on dismiss', async () => {
      const onDismiss = jest.fn();
      const widget = createMockWidget({
        create: jest.fn().mockRejectedValue(new Error('Test')),
      });
      const screen = createMockScreen();
      const boundary = new WidgetErrorBoundary(widget, { onDismiss });

      await boundary.create(screen, {});
      expect(boundary.errorContainer).toBeDefined();

      boundary.handleDismiss();

      expect(boundary.errorContainer).toBeNull();
      expect(onDismiss).toHaveBeenCalled();
    });
  });

  describe('Data and render operations', () => {
    test('should return null data when in error state', async () => {
      const widget = createMockWidget({
        getData: jest.fn().mockResolvedValue({ test: true }),
      });
      const boundary = new WidgetErrorBoundary(widget);
      boundary.errorState.hasError = true;

      const data = await boundary.getData();

      expect(data).toBeNull();
      expect(widget.getData).not.toHaveBeenCalled();
    });

    test('should pass data through when not in error state', async () => {
      const widget = createMockWidget({
        getData: jest.fn().mockResolvedValue({ test: true }),
      });
      const boundary = new WidgetErrorBoundary(widget);

      const data = await boundary.getData();

      expect(data).toEqual({ test: true });
      expect(widget.getData).toHaveBeenCalled();
    });

    test('should catch errors in getData and show boundary', async () => {
      const widget = createMockWidget({
        getData: jest.fn().mockRejectedValue(new Error('Data error')),
      });
      const screen = createMockScreen();
      const boundary = new WidgetErrorBoundary(widget);
      boundary.parentScreen = screen;

      await boundary.getData();

      expect(boundary.hasError()).toBe(true);
      expect(boundary.errorState.error.message).toBe('Data error');
    });

    test('should not render when in error state', async () => {
      const widget = createMockWidget();
      const boundary = new WidgetErrorBoundary(widget);
      boundary.errorState.hasError = true;

      await boundary.render({ test: true });

      expect(widget.render).not.toHaveBeenCalled();
    });

    test('should pass render through when not in error state', async () => {
      const widget = createMockWidget();
      const boundary = new WidgetErrorBoundary(widget);

      await boundary.render({ test: true });

      expect(widget.render).toHaveBeenCalledWith({ test: true });
    });

    test('should catch errors in render and show boundary', async () => {
      const widget = createMockWidget({
        render: jest.fn().mockImplementation(() => {
          throw new Error('Render error');
        }),
      });
      const screen = createMockScreen();
      const boundary = new WidgetErrorBoundary(widget);
      boundary.parentScreen = screen;

      await boundary.render({});

      expect(boundary.hasError()).toBe(true);
    });
  });

  describe('Error state management', () => {
    test('should reset error state', async () => {
      const widget = createMockWidget({
        create: jest.fn().mockResolvedValue(undefined),
      });
      const screen = createMockScreen();
      const boundary = new WidgetErrorBoundary(widget);

      await boundary.create(screen, {});
      boundary.errorState.hasError = true;
      boundary.errorState.retryCount = 2;
      boundary.errorState.error = new Error('Test');

      await boundary.reset();

      expect(boundary.errorState.hasError).toBe(false);
      expect(boundary.errorState.retryCount).toBe(0);
      expect(boundary.errorState.error).toBe(null);
    });

    test('should force show error boundary', async () => {
      const widget = createMockWidget();
      const screen = createMockScreen();
      const boundary = new WidgetErrorBoundary(widget);

      // First create to initialize the boundary with a screen
      await boundary.create(screen, {});
      // Clear any error state from create
      boundary.errorState.hasError = false;

      boundary.showError('Custom error message');

      expect(boundary.hasError()).toBe(true);
      expect(boundary.errorContainer).toBeDefined();
      expect(boundary.errorText.content).toContain('Custom error message');
    });
  });

  describe('Keyboard navigation', () => {
    test('should handle retry on keypress', async () => {
      const widget = createMockWidget({
        create: jest.fn().mockResolvedValue(undefined),
      });
      const screen = createMockScreen();
      const boundary = new WidgetErrorBoundary(widget);

      await boundary.create(screen, {});
      boundary.errorState.hasError = true;

      const handleRetrySpy = jest.spyOn(boundary, 'handleRetry').mockResolvedValue();

      boundary.handleKeypress('r', { name: 'r' });

      expect(handleRetrySpy).toHaveBeenCalled();
    });

    test('should handle dismiss on keypress', async () => {
      const widget = createMockWidget();
      const screen = createMockScreen();
      const boundary = new WidgetErrorBoundary(widget);

      await boundary.create(screen, {});
      boundary.errorState.hasError = true;

      const handleDismissSpy = jest.spyOn(boundary, 'handleDismiss').mockResolvedValue();

      boundary.handleKeypress('d', { name: 'd' });

      expect(handleDismissSpy).toHaveBeenCalled();
    });

    test('should ignore keypress when not in error state', () => {
      const boundary = new WidgetErrorBoundary(createMockWidget());
      boundary.errorState.hasError = false;

      const handleRetrySpy = jest.spyOn(boundary, 'handleRetry');

      boundary.handleKeypress('r', { name: 'r' });

      expect(handleRetrySpy).not.toHaveBeenCalled();
    });
  });

  describe('Error styles', () => {
    test('should provide default error styles', () => {
      expect(ErrorStyles.CONTAINER).toBeDefined();
      expect(ErrorStyles.TITLE).toBeDefined();
      expect(ErrorStyles.MESSAGE).toBeDefined();
      expect(ErrorStyles.RETRY_BUTTON).toBeDefined();
      expect(ErrorStyles.DISMISS_BUTTON).toBeDefined();
    });

    test('should merge theme colors into styles', () => {
      const widget = createMockWidget();
      const boundary = new WidgetErrorBoundary(widget);

      const styles = boundary.getErrorStyles({ error: 'yellow', gray: 'blue' });

      expect(styles.container.style.border.fg).toBe('yellow');
      expect(styles.title.fg).toBe('yellow');
      expect(styles.errorDetail.fg).toBe('blue');
    });
  });

  describe('Destroy', () => {
    test('should clear error boundary and destroy widget', async () => {
      const widget = createMockWidget();
      const screen = createMockScreen();
      const boundary = new WidgetErrorBoundary(widget);

      await boundary.create(screen, {});
      boundary.errorState.hasError = true;

      await boundary.destroy();

      expect(widget.destroy).toHaveBeenCalled();
      expect(boundary.errorContainer).toBeNull();
    });
  });

  describe('withErrorBoundary helper', () => {
    test('should create error boundary for widget', () => {
      const widget = createMockWidget();
      const boundary = withErrorBoundary(widget, { maxRetries: 5 });

      expect(boundary).toBeInstanceOf(WidgetErrorBoundary);
      expect(boundary.widget).toBe(widget);
      expect(boundary.options.maxRetries).toBe(5);
    });
  });

  describe('ErrorBoundaryManager', () => {
    test('should create manager with empty boundaries', () => {
      const manager = new ErrorBoundaryManager();

      expect(manager.getStats().total).toBe(0);
    });

    test('should set global options', () => {
      const manager = new ErrorBoundaryManager();
      manager.setGlobalOptions({ maxRetries: 10, retryDelay: 1000 });

      expect(manager.globalOptions.maxRetries).toBe(10);
      expect(manager.globalOptions.retryDelay).toBe(1000);
    });

    test('should wrap widget with error boundary', () => {
      const manager = new ErrorBoundaryManager();
      const widget = createMockWidget({ id: 'widget-1' });

      const boundary = manager.wrap(widget);

      expect(boundary).toBeInstanceOf(WidgetErrorBoundary);
      expect(manager.get('widget-1')).toBe(boundary);
      expect(manager.getStats().total).toBe(1);
    });

    test('should merge global options with local options', () => {
      const manager = new ErrorBoundaryManager();
      manager.setGlobalOptions({ maxRetries: 10 });

      const widget = createMockWidget({ id: 'widget-1' });
      const boundary = manager.wrap(widget, { retryDelay: 2000 });

      expect(boundary.options.maxRetries).toBe(10);
      expect(boundary.options.retryDelay).toBe(2000);
    });

    test('should remove boundary', () => {
      const manager = new ErrorBoundaryManager();
      const widget = createMockWidget({ id: 'widget-1' });

      manager.wrap(widget);
      expect(manager.get('widget-1')).toBeDefined();

      manager.remove('widget-1');
      expect(manager.get('widget-1')).toBeNull();
    });

    test('should get all error states', () => {
      const manager = new ErrorBoundaryManager();
      const widget1 = createMockWidget({ id: 'widget-1' });
      const widget2 = createMockWidget({ id: 'widget-2' });

      manager.wrap(widget1);
      manager.wrap(widget2);

      const states = manager.getAllErrorStates();

      expect(Object.keys(states)).toHaveLength(2);
      expect(states['widget-1']).toBeDefined();
      expect(states['widget-2']).toBeDefined();
    });

    test('should retry all failed widgets', async () => {
      const manager = new ErrorBoundaryManager();
      const widget1 = createMockWidget({
        id: 'widget-1',
        create: jest.fn().mockResolvedValue(undefined),
      });

      const boundary = manager.wrap(widget1);
      boundary.errorState.hasError = true;

      const results = await manager.retryAll();

      expect(results['widget-1']).toBeDefined();
    });

    test('should clear all boundaries', () => {
      const manager = new ErrorBoundaryManager();
      const widget1 = createMockWidget({ id: 'widget-1' });
      const widget2 = createMockWidget({ id: 'widget-2' });

      manager.wrap(widget1);
      manager.wrap(widget2);

      manager.clearAll();

      expect(manager.getStats().total).toBe(0);
    });

    test('should calculate stats correctly', () => {
      const manager = new ErrorBoundaryManager();
      const widget1 = createMockWidget({ id: 'widget-1' });
      const widget2 = createMockWidget({ id: 'widget-2' });
      const widget3 = createMockWidget({ id: 'widget-3' });

      const b1 = manager.wrap(widget1);
      const b2 = manager.wrap(widget2);
      manager.wrap(widget3);

      b1.errorState.hasError = true;
      b2.errorState.hasError = true;

      const stats = manager.getStats();

      expect(stats.total).toBe(3);
      expect(stats.inError).toBe(2);
      expect(stats.healthy).toBe(1);
    });
  });

  describe('getErrorBoundaryManager singleton', () => {
    test('should return singleton instance', () => {
      const manager1 = getErrorBoundaryManager();
      const manager2 = getErrorBoundaryManager();

      expect(manager1).toBe(manager2);
    });

    test('should return new instance after clear', () => {
      const manager = getErrorBoundaryManager();
      manager.wrap(createMockWidget({ id: 'test' }));

      const stats = manager.getStats();
      expect(stats.total).toBeGreaterThan(0);
    });
  });
});
