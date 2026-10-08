/**
 * Tests for disconnected-mode.js
 *
 * These tests discriminate against the old "error-spam" behavior: they assert
 * that repeated failures do NOT re-surface an error every poll, that entering
 * and exiting disconnected mode emits exactly one transition each, and that a
 * successful cycle clears the state.
 */

import disconnectedMode, {
  DisconnectedModeManager,
  DISCONNECT_REASON,
  DISCONNECTED_STYLE,
  DEFAULT_ERROR_RESURFACE_INTERVAL_MS
} from '../src/disconnected-mode.js';

describe('Disconnected Mode', () => {
  let manager;

  beforeEach(() => {
    manager = new DisconnectedModeManager();
  });

  afterEach(() => {
    manager.reset();
  });

  describe('initial state', () => {
    test('starts connected', () => {
      expect(manager.isDisconnected()).toBe(false);
      const state = manager.getState();
      expect(state.disconnected).toBe(false);
      expect(state.reason).toBeNull();
      expect(state.since).toBeNull();
      expect(state.transitionCount).toBe(0);
      expect(state.recoveryCount).toBe(0);
    });
  });

  describe('entering disconnected mode', () => {
    test('first failure enters disconnected mode', () => {
      const result = manager.handleFailure('Request failed', DISCONNECT_REASON.FETCH_ERROR);

      expect(result.entered).toBe(true);
      expect(result.shouldSurfaceError).toBe(true);
      expect(manager.isDisconnected()).toBe(true);
      expect(manager.getState().reason).toBe(DISCONNECT_REASON.FETCH_ERROR);
      expect(manager.getState().transitionCount).toBe(1);
    });

    test('records the error message that caused disconnection', () => {
      manager.handleFailure('Session fetch error: Request failed', DISCONNECT_REASON.FETCH_ERROR);
      expect(manager.getState().lastError).toBe('Session fetch error: Request failed');
    });

    test('counts consecutive failures', () => {
      manager.handleFailure('e1');
      manager.handleFailure('e2');
      manager.handleFailure('e3');
      expect(manager.getState().failureCount).toBe(3);
    });
  });

  describe('error suppression while disconnected', () => {
    test('does NOT re-surface the error on every subsequent poll', () => {
      manager.handleFailure('Request failed');

      // Simulate many rapid polls within the throttle window.
      const results = [];
      for (let i = 0; i < 50; i++) {
        results.push(manager.handleFailure('Request failed'));
      }

      // Old behavior would have surfaced 50 error lines. New behavior: none.
      expect(results.every(r => r.entered === false)).toBe(true);
      expect(results.every(r => r.shouldSurfaceError === false)).toBe(true);
    });

    test('re-surfaces the error once the throttle interval elapses', () => {
      manager.handleFailure('Request failed');

      // Simulate the resurface interval having elapsed.
      manager.lastSurfacedAt = Date.now() - (DEFAULT_ERROR_RESURFACE_INTERVAL_MS + 1000);

      const result = manager.handleFailure('Request failed');
      expect(result.entered).toBe(false);
      expect(result.shouldSurfaceError).toBe(true);
    });

    test('stays disconnected across throttled failures', () => {
      manager.handleFailure('e1');
      manager.lastSurfacedAt = Date.now() - (DEFAULT_ERROR_RESURFACE_INTERVAL_MS + 1000);
      manager.handleFailure('e2');
      manager.handleFailure('e3');

      expect(manager.isDisconnected()).toBe(true);
      // Only the initial transition counted - reconnecting is a separate event.
      expect(manager.getState().transitionCount).toBe(1);
    });
  });

  describe('exiting disconnected mode', () => {
    test('success after disconnection exits cleanly exactly once', () => {
      manager.handleFailure('Request failed');
      expect(manager.isDisconnected()).toBe(true);

      const first = manager.handleSuccess();
      expect(first.recovered).toBe(true);
      expect(manager.isDisconnected()).toBe(false);
      expect(manager.getState().reason).toBeNull();
      expect(manager.getState().lastError).toBeNull();
      expect(manager.getState().recoveryCount).toBe(1);

      // Subsequent successes are no-ops (no duplicate recovery render).
      const second = manager.handleSuccess();
      expect(second.recovered).toBe(false);
      expect(manager.getState().recoveryCount).toBe(1);
    });

    test('success while already connected is a no-op', () => {
      const result = manager.handleSuccess();
      expect(result.recovered).toBe(false);
      expect(manager.getState().recoveryCount).toBe(0);
    });

    test('resets failure count on recovery', () => {
      manager.handleFailure('e1');
      manager.handleFailure('e2');
      manager.handleSuccess();
      expect(manager.getState().failureCount).toBe(0);
    });

    test('reports outage duration on recovery', () => {
      manager.handleFailure('e1');
      manager.since = Date.now() - 5000;
      const result = manager.handleSuccess();
      expect(result.durationMs).toBeGreaterThanOrEqual(5000);
    });
  });

  describe('transition listeners', () => {
    test('notifies on enter and exit, not on throttled polls', () => {
      const events = [];
      manager.onTransition(state => events.push(state.disconnected));

      manager.handleFailure('e1');
      manager.handleFailure('e2'); // throttled - no event
      manager.handleFailure('e3'); // throttled - no event
      manager.handleSuccess();

      expect(events).toEqual([true, false]);
    });

    test('onTransition returns an unsubscribe function', () => {
      const unsubscribe = manager.onTransition(() => {});
      expect(typeof unsubscribe).toBe('function');
      expect(() => unsubscribe()).not.toThrow();
    });

    test('unsubscribe stops notifications', () => {
      const events = [];
      const unsubscribe = manager.onTransition(state => events.push(state.disconnected));
      manager.handleFailure('e1');
      unsubscribe();
      manager.handleSuccess();

      expect(events).toEqual([true]);
    });

    test('listener errors do not break transitions', () => {
      manager.onTransition(() => { throw new Error('boom'); });
      expect(() => manager.handleFailure('e1')).not.toThrow();
      expect(manager.isDisconnected()).toBe(true);
    });
  });

  describe('repeated enter/exit cycles', () => {
    test('counts transitions across multiple outages', () => {
      manager.handleFailure('e1');
      manager.handleSuccess();
      manager.handleFailure('e2');
      manager.handleFailure('e3');
      manager.handleSuccess();

      const state = manager.getState();
      expect(state.transitionCount).toBe(2);
      expect(state.recoveryCount).toBe(2);
      expect(state.disconnected).toBe(false);
    });

    test('durationMs is zero while connected', () => {
      expect(manager.getState().durationMs).toBe(0);
    });
  });

  describe('banner text', () => {
    test('shows offline message with red styling', () => {
      manager.handleFailure('Request failed');
      const banner = manager.getBannerText();
      expect(banner).toContain(DISCONNECTED_STYLE.message);
      expect(banner).toContain(DISCONNECTED_STYLE.bannerColor);
      expect(banner).toContain('reconnecting');
    });
  });

  describe('singleton default export', () => {
    test('exports a shared manager instance', () => {
      expect(disconnectedMode).toBeInstanceOf(DisconnectedModeManager);
    });

    test('DISCONNECT_REASON is frozen with expected keys', () => {
      expect(Object.isFrozen(DISCONNECT_REASON)).toBe(true);
      expect(DISCONNECT_REASON.FETCH_ERROR).toBe('fetch-error');
      expect(DISCONNECT_REASON.ALL_UNREACHABLE).toBe('all-unreachable');
    });
  });
});
