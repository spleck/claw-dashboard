/**
 * Disconnected Mode Module
 *
 * Tracks gateway connectivity across refresh cycles and drives a distinct
 * "disconnected mode" visual state for the dashboard.
 *
 * When the gateway becomes unreachable the dashboard enters disconnected
 * mode: the last good frame is retained (never blanked/corrupted) and a
 * red offline banner is shown. Repeated per-poll errors are suppressed so
 * they are surfaced once on the state transition instead of every cycle.
 * Polling continues in the background; once the gateway is reachable again
 * the dashboard exits disconnected mode cleanly and resumes live updates.
 *
 * This mirrors the transient-state pattern used by loading-states.js and the
 * rate limiting used by alerts.js, without introducing new dependencies.
 */

import logger from './logger.js';

/**
 * Reasons a refresh cycle can mark the gateway unreachable.
 * @type {string}
 */
export const DISCONNECT_REASON = Object.freeze({
  FETCH_ERROR: 'fetch-error',
  ALL_UNREACHABLE: 'all-unreachable',
});

/**
 * Visual state applied to the dashboard while disconnected.
 */
export const DISCONNECTED_STYLE = Object.freeze({
  bannerColor: 'bright-red',
  borderColor: 'red',
  message: 'GATEWAY OFFLINE',
  hint: 'reconnecting…',
});

/**
 * How often (ms) an ongoing outage may re-surface its error message once the
 * initial transition message has been shown. Prevents per-poll error spam
 * while still reminding the user during a long outage.
 */
export const DEFAULT_ERROR_RESURFACE_INTERVAL_MS = 30000;

/**
 * Manages the disconnected/reconnected lifecycle for the dashboard.
 */
class DisconnectedModeManager {
  constructor(options = {}) {
    this.errorResurfaceIntervalMs =
      options.errorResurfaceIntervalMs ?? DEFAULT_ERROR_RESURFACE_INTERVAL_MS;

    /** @type {boolean} */
    this.disconnected = false;
    /** @type {string|null} */
    this.reason = null;
    /** @type {number|null} - when disconnected mode was entered */
    this.since = null;
    /** @type {string|null} - last error message that caused/maintains disconnection */
    this.lastError = null;
    /** @type {number} - timestamp of last surfaced error message */
    this.lastSurfacedAt = null;
    /** @type {number} - number of consecutive failing refresh cycles */
    this.failureCount = 0;
    /** @type {number} - total transitions into disconnected mode */
    this.transitionCount = 0;
    /** @type {number} - total transitions back to connected */
    this.recoveryCount = 0;
    /** @type {Set<Function>} */
    this.listeners = new Set();
  }

  /**
   * Register a listener notified on state transitions.
   * @param {Function} callback - Called with (state) after a transition
   * @returns {Function} unsubscribe
   */
  onTransition(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * @private
   */
  _emit(state) {
    for (const callback of this.listeners) {
      try {
        callback(state);
      } catch (err) {
        logger.debug(`Disconnected mode listener error: ${err.message}`);
      }
    }
  }

  /**
   * Current state snapshot.
   * @returns {Object}
   */
  getState() {
    return {
      disconnected: this.disconnected,
      reason: this.reason,
      since: this.since,
      lastError: this.lastError,
      failureCount: this.failureCount,
      durationMs: this.since ? Date.now() - this.since : 0,
      transitionCount: this.transitionCount,
      recoveryCount: this.recoveryCount,
    };
  }

  /**
   * Report a failed refresh cycle.
   *
   * Enters disconnected mode on the first failure; subsequent failures keep
   * the mode active but do NOT re-render an error line every poll. The error
   * is only surfaced again once the resurface interval has elapsed.
   *
   * @param {string} [message] - Error message from this cycle
   * @param {string} [reason] - DISCONNECT_REASON value
   * @returns {{entered: boolean, shouldSurfaceError: boolean, state: Object}}
   */
  handleFailure(message = null, reason = DISCONNECT_REASON.FETCH_ERROR) {
    this.failureCount++;
    if (message) this.lastError = message;

    if (!this.disconnected) {
      this.disconnected = true;
      this.reason = reason;
      this.since = Date.now();
      this.lastSurfacedAt = this.since;
      this.transitionCount++;
      logger.warn(`Gateway unreachable - entering disconnected mode (${reason})`);
      const state = this.getState();
      this._emit(state);
      return { entered: true, shouldSurfaceError: true, state };
    }

    // Already disconnected: throttle error surfacing.
    const now = Date.now();
    const shouldSurfaceError =
      this.lastSurfacedAt === null ||
      now - this.lastSurfacedAt >= this.errorResurfaceIntervalMs;

    if (shouldSurfaceError) {
      this.lastSurfacedAt = now;
    }

    return { entered: false, shouldSurfaceError, state: this.getState() };
  }

  /**
   * Report a successful refresh cycle.
   *
   * Clears disconnected mode. Returns entered=false on the first success so
   * the transition is emitted exactly once.
   *
   * @returns {{recovered: boolean, durationMs: number, state: Object}}
   */
  handleSuccess() {
    this.failureCount = 0;

    if (!this.disconnected) {
      return { recovered: false, durationMs: 0, state: this.getState() };
    }

    const durationMs = this.since ? Date.now() - this.since : 0;
    this.disconnected = false;
    this.reason = null;
    this.since = null;
    this.lastError = null;
    this.lastSurfacedAt = null;
    this.recoveryCount++;
    logger.info(`Gateway reconnected - exiting disconnected mode after ${Math.round(durationMs / 1000)}s`);
    const state = this.getState();
    this._emit(state);
    return { recovered: true, durationMs, state };
  }

  /**
   * @returns {boolean}
   */
  isDisconnected() {
    return this.disconnected;
  }

  /**
   * Build banner text for the disconnected state.
   * @returns {string}
   */
  getBannerText() {
    const style = DISCONNECTED_STYLE;
    const duration = this.since ? Math.round((Date.now() - this.since) / 1000) : 0;
    const durationText = duration > 0 ? ` (${duration}s)` : '';
    return `{${style.bannerColor}-fg}✗ ${style.message}${durationText} — ${style.hint}{/${style.bannerColor}-fg}`;
  }

  /**
   * Reset all state (used on shutdown/tests).
   */
  reset() {
    this.disconnected = false;
    this.reason = null;
    this.since = null;
    this.lastError = null;
    this.lastSurfacedAt = null;
    this.failureCount = 0;
    this.transitionCount = 0;
    this.recoveryCount = 0;
    this.listeners.clear();
  }
}

export const disconnectedMode = new DisconnectedModeManager();

export default disconnectedMode;
export { DisconnectedModeManager };
