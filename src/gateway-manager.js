/**
 * Gateway Manager Module
 * Manages multiple OpenClaw gateway endpoints and aggregates data
 */

import fs from 'fs';
import https from 'https';
import http from 'http';
import logger from './logger.js';
import config, { DEFAULT_GATEWAY_ENDPOINT, GATEWAY } from './config.js';
import { GatewayError, NetworkError, AuthError, TimeoutError, ChecksumError } from './errors.js';
import { verifyResponseChecksum, getChecksumMetadata } from './checksum.js';

/**
 * @typedef {Object} GatewayEndpoint
 * @property {string} name - Endpoint display name
 * @property {string} host - Hostname or IP address
 * @property {number} port - Port number
 * @property {string|null} token - Authentication token
 * @property {boolean} enabled - Whether endpoint is enabled
 * @property {string} type - Endpoint type: 'local', 'remote', 'cloud'
 * @property {boolean} [reachable] - Last known reachability status
 * @property {number} [lastSeen] - Timestamp of last successful connection
 * @property {string} [error] - Last error message
 */

/**
 * @typedef {Object} AggregatedSession
 * @property {string} key - Session key
 * @property {string} channel - Channel name
 * @property {string} displayName - Display name
 * @property {number} updatedAt - Last update timestamp
 * @property {string} sessionId - Session ID
 * @property {string} model - Model name
 * @property {number} contextTokens - Context window size
 * @property {number} totalTokens - Total tokens used
 * @property {string} kind - Session kind
 * @property {Object} deliveryContext - Delivery context
 * @property {boolean} systemSent - System message sent
 * @property {boolean} abortedLastRun - Was last run aborted
 * @property {string} lastChannel - Last channel
 * @property {string} lastTo - Last recipient
 * @property {string} lastAccountId - Last account ID
 * @property {string} transcriptPath - Path to transcript
 * @property {string} gatewayEndpoint - Name of gateway endpoint this session belongs to
 * @property {string} gatewayHost - Host of gateway endpoint
 */

class GatewayManager {
  constructor() {
    /** @type {GatewayEndpoint[]} */
    this.endpoints = [];
    /** @type {Map<string, number>} */
    this.endpointLatency = new Map();
    /** @type {Map<string, number>} */
    this.endpointFailCount = new Map();
    /** @type {Map<string, number>} */
    this.endpointChecksumFailCount = new Map();
    /** @type {Map<string, boolean>} */
    this.endpointChecksumVerified = new Map();
  }

  /**
   * Initialize the gateway manager with settings
   * @param {Object} settings - Dashboard settings
   */
  init(settings) {
    if (settings.gatewayEndpoints && Array.isArray(settings.gatewayEndpoints)) {
      this.endpoints = settings.gatewayEndpoints.map(ep => ({
        ...DEFAULT_GATEWAY_ENDPOINT,
        ...ep,
        // Ensure required fields
        name: ep.name || 'unnamed',
        host: ep.host || 'localhost',
        port: ep.port || GATEWAY.DEFAULT_PORT,
        enabled: ep.enabled !== false, // Default to true
      }));
    } else {
      // Fallback to default single endpoint
      this.endpoints = [{ ...DEFAULT_GATEWAY_ENDPOINT }];
    }

    logger.info(`GatewayManager initialized with ${this.endpoints.length} endpoint(s)`);
  }

  /**
   * Get all enabled endpoints
   * @returns {GatewayEndpoint[]}
   */
  getEnabledEndpoints() {
    return this.endpoints.filter(ep => ep.enabled);
  }

  /**
   * Get all endpoints (including disabled)
   * @returns {GatewayEndpoint[]}
   */
  getAllEndpoints() {
    return [...this.endpoints];
  }

  /**
   * Get a specific endpoint by name
   * @param {string} name - Endpoint name
   * @returns {GatewayEndpoint|undefined}
   */
  getEndpoint(name) {
    return this.endpoints.find(ep => ep.name === name);
  }

  /**
   * Add a new endpoint
   * @param {Partial<GatewayEndpoint>} endpointConfig - Endpoint configuration
   * @returns {GatewayEndpoint|null} - The added endpoint or null if failed
   */
  addEndpoint(endpointConfig) {
    if (this.endpoints.length >= GATEWAY.MAX_ENDPOINTS) {
      logger.warn(`Cannot add endpoint: maximum of ${GATEWAY.MAX_ENDPOINTS} endpoints reached`);
      return null;
    }

    // Check for duplicate names
    if (this.endpoints.some(ep => ep.name === endpointConfig.name)) {
      logger.warn(`Cannot add endpoint: name '${endpointConfig.name}' already exists`);
      return null;
    }

    const newEndpoint = {
      ...DEFAULT_GATEWAY_ENDPOINT,
      ...endpointConfig,
      enabled: true,
    };

    this.endpoints.push(newEndpoint);
    logger.info(`Added gateway endpoint: ${newEndpoint.name} (${newEndpoint.host}:${newEndpoint.port})`);
    return newEndpoint;
  }

  /**
   * Remove an endpoint by name
   * @param {string} name - Endpoint name to remove
   * @returns {boolean} - True if removed, false if not found
   */
  removeEndpoint(name) {
    const idx = this.endpoints.findIndex(ep => ep.name === name);
    if (idx === -1) {
      return false;
    }

    // Don't allow removing the last endpoint
    if (this.endpoints.length <= 1) {
      logger.warn('Cannot remove the last gateway endpoint');
      return false;
    }

    this.endpoints.splice(idx, 1);
    logger.info(`Removed gateway endpoint: ${name}`);
    return true;
  }

  /**
   * Update an endpoint
   * @param {string} name - Endpoint name to update
   * @param {Partial<GatewayEndpoint>} updates - Fields to update
   * @returns {GatewayEndpoint|null} - Updated endpoint or null if not found
   */
  updateEndpoint(name, updates) {
    const idx = this.endpoints.findIndex(ep => ep.name === name);
    if (idx === -1) {
      return null;
    }

    // Don't allow renaming to a duplicate name
    if (updates.name && updates.name !== name && this.endpoints.some(ep => ep.name === updates.name)) {
      logger.warn(`Cannot rename endpoint: name '${updates.name}' already exists`);
      return null;
    }

    this.endpoints[idx] = { ...this.endpoints[idx], ...updates };
    logger.info(`Updated gateway endpoint: ${name}`);
    return this.endpoints[idx];
  }

  /**
   * Toggle endpoint enabled state
   * @param {string} name - Endpoint name
   * @param {boolean} enabled - New enabled state
   * @returns {boolean} - True if toggled, false if not found
   */
  toggleEndpoint(name, enabled) {
    const ep = this.getEndpoint(name);
    if (!ep) {
      return false;
    }

    // Don't allow disabling the last enabled endpoint
    if (!enabled && this.getEnabledEndpoints().length <= 1) {
      logger.warn('Cannot disable the last enabled gateway endpoint');
      return false;
    }

    ep.enabled = enabled;
    logger.info(`Gateway endpoint ${name} ${enabled ? 'enabled' : 'disabled'}`);
    return true;
  }

  /**
   * Build sessions URL for an endpoint
   * @param {GatewayEndpoint} endpoint
   * @returns {string}
   */
  buildSessionsUrl(endpoint) {
    const protocol = endpoint.port === 443 ? 'https' : 'http';
    return `${protocol}://${endpoint.host}:${endpoint.port}/sessions`;
  }

  /**
   * Fetch sessions from a single endpoint
   * @param {GatewayEndpoint} endpoint
   * @returns {Promise<AggregatedSession[]>}
   */
  async fetchSessionsFromEndpoint(endpoint) {
    const startTime = Date.now();

    try {
      // First try HTTP API endpoint
      const sessions = await this.fetchFromHttpApi(endpoint);
      if (sessions && sessions.length > 0) {
        // HTTP API succeeded - mark as reachable
        // Note: checksum verification happens inside fetchFromHttpApi, so we only get here if it passed
        this.updateEndpointHealth(endpoint.name, true, Date.now() - startTime, null, true, false);
        return sessions.map(s => this.enrichSession(s, endpoint));
      }
    } catch (err) {
      logger.debug(`HTTP API fetch failed for ${endpoint.name}: ${err.message}`);

      // Handle checksum verification failures specifically
      if (err instanceof ChecksumError) {
        this.updateEndpointHealth(endpoint.name, false, null, err.message, false, true);
        logger.error(`Checksum verification failed for ${endpoint.name}: ${err.message}`);
        return [];
      }
    }

    // Fallback to local file system for local endpoints
    if (endpoint.type === 'local' || endpoint.host === 'localhost' || endpoint.host === '127.0.0.1') {
      try {
        const sessions = await this.fetchFromLocalFile(endpoint);
        if (sessions) {
          this.updateEndpointHealth(endpoint.name, true, Date.now() - startTime);
          return sessions.map(s => this.enrichSession(s, endpoint));
        }
      } catch (err) {
        logger.debug(`Local file fetch failed for ${endpoint.name}: ${err.message}`);
      }
    }

    this.updateEndpointHealth(endpoint.name, false, null, 'Failed to fetch sessions');
    return [];
  }

  /**
   * Fetch sessions from HTTP API
   * @param {GatewayEndpoint} endpoint
   * @returns {Promise<Object[]|null>}
   */
  fetchFromHttpApi(endpoint) {
    return new Promise((resolve, reject) => {
      const url = this.buildSessionsUrl(endpoint);
      const client = url.startsWith('https:') ? https : http;

      const options = {
        timeout: GATEWAY.TIMEOUT_MS,
        headers: {
          'Accept': 'application/json',
        },
      };

      if (endpoint.token) {
        options.headers['Authorization'] = `Bearer ${endpoint.token}`;
      }

      const req = client.get(url, options, (res) => {
        let data = '';

        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          if (res.statusCode === 200) {
            try {
              // Verify checksum if enabled and header present
              const checksumResult = verifyResponseChecksum(res, data);

              if (!checksumResult.verified) {
                // Log checksum failure with metadata
                const metadata = getChecksumMetadata(res);
                logger.warn(`Checksum verification failed for ${endpoint.name}: ${checksumResult.error}`, {
                  endpoint: endpoint.name,
                  headerPresent: metadata.headerPresent,
                  strictMode: metadata.strictMode
                });

                reject(new ChecksumError(
                  `Response integrity check failed: ${checksumResult.error}`,
                  {
                    endpoint: endpoint.name,
                    headerName: metadata.headerName,
                    headerPresent: metadata.headerPresent
                  }
                ));
                return;
              }

              // Log successful checksum verification if header was present
              if (checksumResult.checksum) {
                logger.debug(`Checksum verified for ${endpoint.name}: ${checksumResult.checksum.substring(0, 16)}...`);
              }

              const parsed = JSON.parse(data);
              resolve(Array.isArray(parsed) ? parsed : Object.values(parsed));
            } catch (err) {
              if (err instanceof ChecksumError) {
                reject(err);
              } else {
                reject(new GatewayError(`Invalid JSON response: ${err.message}`));
              }
            }
          } else if (res.statusCode === 401 || res.statusCode === 403) {
            reject(new AuthError(`Authentication failed for ${endpoint.name}`));
          } else {
            reject(new GatewayError(`HTTP ${res.statusCode}`));
          }
        });
      });

      req.on('error', (err) => {
        reject(new NetworkError(`Connection error: ${err.message}`));
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new TimeoutError(`Request timeout`));
      });

      req.setTimeout(GATEWAY.TIMEOUT_MS);
    });
  }

  /**
   * Fetch sessions from local file system
   * @param {GatewayEndpoint} endpoint
   * @returns {Promise<Object[]|null>}
   */
  async fetchFromLocalFile(endpoint) {
    const sessionsPath = config.PATHS.AGENTS_DIR + '/main/sessions/sessions.json';

    if (!fs.existsSync(sessionsPath)) {
      return null;
    }

    const data = fs.readFileSync(sessionsPath, 'utf8');
    const sessionsObj = JSON.parse(data);

    if (!sessionsObj || typeof sessionsObj !== 'object') {
      return null;
    }

    return Object.entries(sessionsObj).map(([key, session]) => ({
      key,
      channel: session.channel || 'unknown',
      displayName: session.displayName || key,
      updatedAt: session.updatedAt || session.lastMessageAt || 0,
      sessionId: session.sessionId || key,
      model: session.model || 'unknown',
      contextTokens: session.contextWindow || session.contextTokens || 0,
      totalTokens: session.totalTokens || 0,
      kind: session.kind || 'other',
      deliveryContext: session.deliveryContext || {},
      systemSent: session.systemSent || false,
      abortedLastRun: session.abortedLastRun || false,
      lastChannel: session.lastChannel || session.channel || '',
      lastTo: session.lastTo || '',
      lastAccountId: session.lastAccountId || '',
      transcriptPath: session.transcriptPath || '',
    }));
  }

  /**
   * Enrich session with gateway endpoint info
   * @param {Object} session
   * @param {GatewayEndpoint} endpoint
   * @returns {AggregatedSession}
   */
  enrichSession(session, endpoint) {
    return {
      ...session,
      gatewayEndpoint: endpoint.name,
      gatewayHost: `${endpoint.host}:${endpoint.port}`,
    };
  }

  /**
   * Update endpoint health status
   * @param {string} name - Endpoint name
   * @param {boolean} reachable - Whether endpoint is reachable
   * @param {number|null} latency - Response latency in ms
   * @param {string} [error] - Error message if failed
   * @param {boolean} [checksumVerified] - Whether checksum verification passed
   * @param {boolean} [checksumFailed] - Whether checksum verification failed
   */
  updateEndpointHealth(name, reachable, latency, error = null, checksumVerified = false, checksumFailed = false) {
    const ep = this.getEndpoint(name);
    if (!ep) return;

    ep.reachable = reachable;
    ep.lastSeen = reachable ? Date.now() : ep.lastSeen;
    ep.error = error;

    if (latency !== null) {
      this.endpointLatency.set(name, latency);
    }

    if (reachable) {
      this.endpointFailCount.set(name, 0);
    } else {
      const currentFails = this.endpointFailCount.get(name) || 0;
      this.endpointFailCount.set(name, currentFails + 1);
    }

    // Track checksum verification status
    if (checksumVerified) {
      this.endpointChecksumVerified.set(name, true);
    }
    if (checksumFailed) {
      const currentChecksumFails = this.endpointChecksumFailCount.get(name) || 0;
      this.endpointChecksumFailCount.set(name, currentChecksumFails + 1);
    }
  }

  /**
   * Fetch sessions from all enabled endpoints
   * @returns {Promise<{sessions: AggregatedSession[], stats: Object}>}
   */
  async fetchAllSessions() {
    const enabledEndpoints = this.getEnabledEndpoints();

    if (enabledEndpoints.length === 0) {
      logger.warn('No enabled gateway endpoints');
      return { sessions: [], stats: { totalEndpoints: 0, reachableEndpoints: 0 } };
    }

    // Fetch from all endpoints in parallel
    const fetchPromises = enabledEndpoints.map(async (ep) => {
      try {
        const sessions = await this.fetchSessionsFromEndpoint(ep);
        return { endpoint: ep.name, sessions, error: null };
      } catch (err) {
        logger.warn(`Failed to fetch from ${ep.name}: ${err.message}`);
        return { endpoint: ep.name, sessions: [], error: err.message };
      }
    });

    const results = await Promise.all(fetchPromises);

    // Aggregate sessions and stats
    const allSessions = [];
    let reachableCount = 0;

    for (const result of results) {
      if (!result.error) {
        reachableCount++;
        allSessions.push(...result.sessions);
      }
    }

    const stats = {
      totalEndpoints: enabledEndpoints.length,
      reachableEndpoints: reachableCount,
      unreachableEndpoints: enabledEndpoints.length - reachableCount,
    };

    logger.debug(`Fetched ${allSessions.length} sessions from ${reachableCount}/${enabledEndpoints.length} endpoints`);

    return { sessions: allSessions, stats };
  }

  /**
   * Get endpoint health summary
   * @returns {Object[]}
   */
  getEndpointHealth() {
    return this.endpoints.map(ep => ({
      name: ep.name,
      host: ep.host,
      port: ep.port,
      enabled: ep.enabled,
      reachable: ep.reachable || false,
      lastSeen: ep.lastSeen || null,
      latency: this.endpointLatency.get(ep.name) || null,
      failCount: this.endpointFailCount.get(ep.name) || 0,
      error: ep.error || null,
      checksum: {
        verified: this.endpointChecksumVerified.get(ep.name) || false,
        failCount: this.endpointChecksumFailCount.get(ep.name) || 0,
        enabled: config.CHECKSUM.ENABLED,
      },
    }));
  }

  /**
   * Get settings object for saving
   * @returns {Object}
   */
  getSettingsForSave() {
    return {
      gatewayEndpoints: this.endpoints.map(ep => ({
        name: ep.name,
        host: ep.host,
        port: ep.port,
        token: ep.token,
        enabled: ep.enabled,
        type: ep.type,
      })),
    };
  }
}

// Export singleton instance
export const gatewayManager = new GatewayManager();
export default gatewayManager;
