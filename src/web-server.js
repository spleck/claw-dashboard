/**
 * Web Server Module for Claw Dashboard
 * Provides HTTP API for remote access to dashboard data
 * Includes rate limiting and configurable CORS for security
 */

import http from 'http';
import url from 'url';
import logger from './logger.js';
import config from './config.js';
import { ApiKeyAuth } from './security.js';

const { WEB, DASHBOARD_VERSION } = config;

/**
 * Rate limiter for web server requests
 * Tracks requests per IP address with sliding window
 */
class WebRateLimiter {
  constructor(options = {}) {
    this.enabled = options.enabled ?? WEB.RATE_LIMIT.ENABLED;
    this.windowMs = options.windowMs ?? WEB.RATE_LIMIT.WINDOW_MS;
    this.maxRequests = options.maxRequests ?? WEB.RATE_LIMIT.MAX_REQUESTS;
    this.trustProxy = options.trustProxy ?? WEB.RATE_LIMIT.TRUST_PROXY;
    this.requests = new Map(); // ip -> [{ timestamp, count }]
    this.blocked = new Map(); // ip -> unblockTime

    // Start cleanup interval
    this.cleanupInterval = setInterval(() => this.cleanup(), this.windowMs);
  }

  /**
   * Get client IP from request
   * @param {http.IncomingMessage} req - HTTP request
   * @returns {string} Client IP address
   */
  getClientIp(req) {
    // Check for X-Forwarded-For if behind proxy
    if (this.trustProxy) {
      const forwarded = req.headers['x-forwarded-for'];
      if (forwarded) {
        // X-Forwarded-For can be comma-separated, take the first (client)
        return forwarded.split(',')[0].trim();
      }
      const realIp = req.headers['x-real-ip'];
      if (realIp) {
        return realIp;
      }
    }

    // Fall back to connection remote address
    return req.socket?.remoteAddress || req.connection?.remoteAddress || 'unknown';
  }

  /**
   * Check if request is allowed or rate limited
   * @param {http.IncomingMessage} req - HTTP request
   * @returns {object} Result with allowed boolean and retryAfter
   */
  check(req) {
    if (!this.enabled) {
      return { allowed: true, remaining: this.maxRequests };
    }

    const ip = this.getClientIp(req);
    const now = Date.now();

    // Check if IP is currently blocked
    const unblockTime = this.blocked.get(ip);
    if (unblockTime && now < unblockTime) {
      return {
        allowed: false,
        retryAfter: Math.ceil((unblockTime - now) / 1000),
        ip
      };
    }

    // Remove from blocked if time has passed
    if (unblockTime && now >= unblockTime) {
      this.blocked.delete(ip);
    }

    // Get or create request history for this IP
    let history = this.requests.get(ip);
    if (!history) {
      history = [];
      this.requests.set(ip, history);
    }

    // Filter to only requests within the current window
    const windowStart = now - this.windowMs;
    const validRequests = history.filter(ts => ts > windowStart);

    // Update history with cleaned up timestamps
    this.requests.set(ip, validRequests);

    // Check if over limit
    if (validRequests.length >= this.maxRequests) {
      // Calculate retry after based on oldest request
      const oldestRequest = validRequests[0];
      const retryAfter = Math.ceil((oldestRequest + this.windowMs - now) / 1000);

      // Block this IP temporarily
      this.blocked.set(ip, now + this.windowMs);

      logger.warn(`[RATE LIMIT] IP ${ip} blocked - exceeded ${this.maxRequests} requests in ${this.windowMs}ms`);

      return {
        allowed: false,
        retryAfter: Math.max(1, retryAfter),
        ip
      };
    }

    return {
      allowed: true,
      remaining: this.maxRequests - validRequests.length,
      ip
    };
  }

  /**
   * Record a request for an IP
   * @param {http.IncomingMessage} req - HTTP request
   */
  record(req) {
    if (!this.enabled) return;

    const ip = this.getClientIp(req);
    const history = this.requests.get(ip) || [];
    history.push(Date.now());
    this.requests.set(ip, history);
  }

  /**
   * Clean up old entries to prevent memory leaks
   */
  cleanup() {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    // Clean up request history
    for (const [ip, history] of this.requests.entries()) {
      const validRequests = history.filter(ts => ts > windowStart);
      if (validRequests.length === 0) {
        this.requests.delete(ip);
      } else {
        this.requests.set(ip, validRequests);
      }
    }

    // Clean up blocked entries
    for (const [ip, unblockTime] of this.blocked.entries()) {
      if (now >= unblockTime) {
        this.blocked.delete(ip);
      }
    }
  }

  /**
   * Get rate limit status for an IP
   * @param {http.IncomingMessage} req - HTTP request
   * @returns {object} Status with count, limit, remaining, resetTime
   */
  getStatus(req) {
    const ip = this.getClientIp(req);

    if (!this.enabled) {
      return {
        enabled: false,
        limit: this.maxRequests,
        remaining: this.maxRequests,
        current: 0,
        resetTime: null,
        ip
      };
    }

    const history = this.requests.get(ip) || [];
    const now = Date.now();
    const windowStart = now - this.windowMs;
    const validRequests = history.filter(ts => ts > windowStart);

    let resetTime = null;
    if (validRequests.length > 0) {
      const oldestRequest = Math.min(...validRequests);
      resetTime = new Date(oldestRequest + this.windowMs).toISOString();
    }

    return {
      enabled: true,
      limit: this.maxRequests,
      remaining: Math.max(0, this.maxRequests - validRequests.length),
      current: validRequests.length,
      resetTime,
      ip
    };
  }

  /**
   * Stop the cleanup interval
   */
  stop() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}

/**
 * CORS configuration manager
 * Handles CORS headers based on configuration
 */
class CorsManager {
  constructor(options = {}) {
    // Support both old config (string) and new config (object/array)
    this.allowedOrigins = options.allowedOrigins ?? WEB.CORS.ALLOWED_ORIGINS;
    this.allowedMethods = options.allowedMethods ?? WEB.CORS.ALLOWED_METHODS;
    this.allowedHeaders = options.allowedHeaders ?? WEB.CORS.ALLOWED_HEADERS;
    this.credentials = options.credentials ?? WEB.CORS.CREDENTIALS;
    this.maxAge = options.maxAge ?? WEB.CORS.MAX_AGE;
  }

  /**
   * Check if an origin is allowed
   * @param {string} origin - Request origin
   * @returns {boolean} True if allowed
   */
  isOriginAllowed(origin) {
    // Allow all origins with '*'
    if (this.allowedOrigins === '*') {
      return true;
    }

    // No origin header (e.g., direct curl request)
    if (!origin) {
      return true;
    }

    // If it's an array, check if origin is in the list
    if (Array.isArray(this.allowedOrigins)) {
      return this.allowedOrigins.some(allowed => {
        if (allowed.includes('*')) {
          // Support wildcard patterns like https://*.example.com
          const pattern = allowed.replace(/\*/g, '.*');
          return new RegExp(`^${pattern}$`).test(origin);
        }
        return allowed === origin;
      });
    }

    // String comparison
    return this.allowedOrigins === origin;
  }

  /**
   * Get CORS headers for a request
   * @param {http.IncomingMessage} req - HTTP request
   * @returns {Object} CORS headers
   */
  getHeaders(req) {
    const origin = req.headers.origin;
    const headers = {
      'Access-Control-Allow-Methods': this.allowedMethods.join(', '),
      'Access-Control-Allow-Headers': this.allowedHeaders.join(', '),
      'Access-Control-Max-Age': this.maxAge.toString(),
      'Content-Type': 'application/json',
    };

    // Handle origin
    if (this.allowedOrigins === '*') {
      // When credentials are used with '*', browser rejects it for security
      // So we mirror the request origin when credentials are enabled
      if (this.credentials && origin) {
        headers['Access-Control-Allow-Origin'] = origin;
        headers['Access-Control-Allow-Credentials'] = 'true';
      } else {
        headers['Access-Control-Allow-Origin'] = '*';
      }
    } else if (this.isOriginAllowed(origin)) {
      headers['Access-Control-Allow-Origin'] = origin || '*';
      if (this.credentials) {
        headers['Access-Control-Allow-Credentials'] = 'true';
      }
    }
    // If origin is not allowed, don't include CORS headers (browser will block)

    return headers;
  }

  /**
   * Check if credentials should be allowed
   * @returns {boolean} True if credentials are allowed
   */
  allowsCredentials() {
    return this.credentials;
  }
}

/**
 * Send JSON response
 * @param {http.ServerResponse} res - HTTP response
 * @param {number} statusCode - HTTP status code
 * @param {Object} data - Response data
 * @param {Object} headers - Additional headers
 */
function sendJson(res, statusCode, data, headers = {}) {
  res.writeHead(statusCode, { ...headers, 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data, null, 2));
}

/**
 * Send error response
 * @param {http.ServerResponse} res - HTTP response
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {Object} headers - Additional headers
 * @param {Object} extra - Extra fields to include in response
 */
function sendError(res, statusCode, message, headers = {}, extra = {}) {
  sendJson(res, statusCode, { error: message, status: statusCode, ...extra }, headers);
}

/**
 * Web Server class for exposing dashboard data via HTTP API
 *
 * SECURITY NOTE (pre-existing defaults, untouched by lean trim to preserve --web UX):
 * - Binds to 0.0.0.0 + CORS * + auth disabled by default (see config WEB.HOST/AUTH/CORS).
 * - Intended for trusted/remote/localhost use or with explicit --web-host + auth keys enabled.
 * - Health is intentionally public; other endpoints (sessions with tokens, logs, metrics) are sensitive.
 * - Recommend: bind localhost, enable auth, restrict CORS origins in production.
 * No changes here as trim focused on deadcode/lean (db/CJS/legacy); no new surface added.
 */
export class WebServer {
  constructor(options = {}) {
    this.port = options.port || WEB.DEFAULT_PORT;
    this.host = options.host || WEB.HOST;
    this.server = null;
    this.dataProvider = null;
    this.startTime = Date.now();
    this.requestCount = 0;
    this.errorCount = 0;

    // Initialize rate limiter
    this.rateLimiter = new WebRateLimiter({
      enabled: options.rateLimit?.enabled ?? WEB.RATE_LIMIT.ENABLED,
      windowMs: options.rateLimit?.windowMs ?? WEB.RATE_LIMIT.WINDOW_MS,
      maxRequests: options.rateLimit?.maxRequests ?? WEB.RATE_LIMIT.MAX_REQUESTS,
      trustProxy: options.rateLimit?.trustProxy ?? WEB.RATE_LIMIT.TRUST_PROXY,
    });

    // Initialize CORS manager
    this.corsManager = new CorsManager({
      allowedOrigins: options.corsOrigins ?? WEB.CORS.ALLOWED_ORIGINS,
      allowedMethods: options.corsMethods ?? WEB.CORS.ALLOWED_METHODS,
      allowedHeaders: options.corsHeaders ?? WEB.CORS.ALLOWED_HEADERS,
      credentials: options.corsCredentials ?? WEB.CORS.CREDENTIALS,
      maxAge: options.corsMaxAge ?? WEB.CORS.MAX_AGE,
    });

    // Initialize API key authentication
    this.apiKeyAuth = new ApiKeyAuth({
      enabled: options.auth?.enabled ?? WEB.AUTH.ENABLED,
      headerName: options.auth?.headerName ?? WEB.AUTH.HEADER_NAME,
      scheme: options.auth?.scheme ?? WEB.AUTH.SCHEME,
      keyPrefix: options.auth?.keyPrefix ?? WEB.AUTH.KEY_PREFIX,
      keyLength: options.auth?.keyLength ?? WEB.AUTH.KEY_LENGTH,
      maxKeys: options.auth?.maxKeys ?? WEB.AUTH.MAX_KEYS,
    });

    // Expose auth management methods
    this.generateApiKey = this.generateApiKey.bind(this);
    this.revokeApiKey = this.revokeApiKey.bind(this);
    this.listApiKeys = this.listApiKeys.bind(this);
  }

  /**
   * Set the data provider function that will supply dashboard data
   * @param {Function} provider - Function that returns dashboard data
   */
  setDataProvider(provider) {
    this.dataProvider = provider;
  }

  /**
   * Get health status
   * @returns {Object} Health status
   */
  getHealth() {
    const uptime = Date.now() - this.startTime;
    return {
      status: 'healthy',
      version: DASHBOARD_VERSION,
      uptime: uptime,
      uptimeHuman: this.formatUptime(uptime),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Format uptime in human-readable format
   * @param {number} ms - Milliseconds
   * @returns {string} Formatted uptime
   */
  formatUptime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
    if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }

  /**
   * Send rate limit response
   * @param {http.ServerResponse} res - HTTP response
   * @param {Object} rateLimitResult - Rate limit check result
   */
  sendRateLimitResponse(res, rateLimitResult) {
    const headers = this.corsManager.getHeaders({ headers: {} });
    headers['Retry-After'] = rateLimitResult.retryAfter.toString();
    headers['X-RateLimit-Limit'] = this.rateLimiter.maxRequests.toString();
    headers['X-RateLimit-Remaining'] = '0';
    headers['X-RateLimit-Reset'] = (Date.now() + rateLimitResult.retryAfter * 1000).toString();

    sendError(res, 429, 'Too many requests', headers, {
      retryAfter: rateLimitResult.retryAfter,
    });
  }

  /**
   * Send CORS-related error (origin not allowed)
   * @param {http.ServerResponse} res - HTTP response
   */
  sendCorsError(res) {
    sendError(res, 403, 'Origin not allowed', {
      'Content-Type': 'application/json',
    });
  }

  /**
   * Add rate limit headers to response
   * @param {http.ServerResponse} res - HTTP response
   * @param {Object} rateLimitStatus - Rate limit status
   */
  addRateLimitHeaders(res, rateLimitStatus) {
    res.setHeader('X-RateLimit-Limit', rateLimitStatus.limit.toString());
    res.setHeader('X-RateLimit-Remaining', rateLimitStatus.remaining.toString());
    if (rateLimitStatus.resetTime) {
      res.setHeader('X-RateLimit-Reset', new Date(rateLimitStatus.resetTime).getTime().toString());
    }
  }

  /**
   * Send authentication error response
   * @param {http.ServerResponse} res - HTTP response
   * @param {Object} authResult - Authentication result from ApiKeyAuth
   * @param {Object} headers - Additional headers
   */
  sendAuthError(res, authResult, headers = {}) {
    const errorHeaders = { ...headers };

    // Add retry-after header if blocked
    if (authResult.retryAfter) {
      errorHeaders['Retry-After'] = authResult.retryAfter.toString();
    }

    // Add WWW-Authenticate header for 401 responses
    const authScheme = this.apiKeyAuth.scheme || 'Bearer';
    errorHeaders['WWW-Authenticate'] = `${authScheme} realm="Claw Dashboard API"`;

    const statusCode = authResult.code === 'AUTH_BLOCKED' ? 429 : 401;
    const extra = authResult.retryAfter ? { retryAfter: authResult.retryAfter } : {};

    sendError(res, statusCode, authResult.error, errorHeaders, { code: authResult.code, ...extra });
  }

  /**
   * Generate a new API key
   * @param {string} name - Human-readable name for the key
   * @returns {Object} Key data including the full key (only shown once)
   */
  generateApiKey(name) {
    return this.apiKeyAuth.generateKey(name);
  }

  /**
   * Revoke an API key
   * @param {string} keyId - The key ID to revoke
   * @returns {boolean} True if key was found and revoked
   */
  revokeApiKey(keyId) {
    const revoked = this.apiKeyAuth.revokeKey(keyId);
    if (revoked) {
      logger.info(`[AUTH] Revoked API key: ${keyId}`);
    }
    return revoked;
  }

  /**
   * List all active API keys
   * @returns {Array} List of key metadata (without actual keys)
   */
  listApiKeys() {
    return this.apiKeyAuth.listKeys();
  }

  /**
   * Check if authentication is enabled
   * @returns {boolean} True if authentication is enabled
   */
  isAuthEnabled() {
    return this.apiKeyAuth.isEnabled();
  }

  /**
   * Enable authentication
   */
  enableAuth() {
    this.apiKeyAuth.enable();
    logger.info('[AUTH] Authentication enabled');
  }

  /**
   * Disable authentication
   */
  disableAuth() {
    this.apiKeyAuth.disable();
    logger.info('[AUTH] Authentication disabled');
  }

  /**
   * Handle incoming HTTP requests
   * @param {http.IncomingMessage} req - HTTP request
   * @param {http.ServerResponse} res - HTTP response
   */
  async handleRequest(req, res) {
    this.requestCount++;
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    // Get CORS headers
    const corsHeaders = this.corsManager.getHeaders(req);

    // Check if CORS origin is allowed
    const origin = req.headers.origin;
    if (origin && !this.corsManager.isOriginAllowed(origin)) {
      this.errorCount++;
      logger.warn(`[CORS] Rejected request from disallowed origin: ${origin}`);
      this.sendCorsError(res);
      return;
    }

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      res.writeHead(200, corsHeaders);
      res.end();
      return;
    }

    // Check rate limit (skip for health endpoint to allow monitoring)
    if (pathname !== WEB.ENDPOINTS.HEALTH) {
      const rateLimitResult = this.rateLimiter.check(req);

      if (!rateLimitResult.allowed) {
        this.errorCount++;
        this.sendRateLimitResponse(res, rateLimitResult);
        return;
      }

      // Record this request
      this.rateLimiter.record(req);

      // Add rate limit headers to successful responses
      const rateLimitStatus = this.rateLimiter.getStatus(req);
      this.addRateLimitHeaders(res, rateLimitStatus);
    }

    // Check authentication (skip for health endpoint)
    if (pathname !== WEB.ENDPOINTS.HEALTH) {
      const clientIp = this.rateLimiter.getClientIp(req);
      const authResult = this.apiKeyAuth.authenticate(req.headers, clientIp);

      if (!authResult.authenticated) {
        this.errorCount++;
        logger.warn(`[AUTH] Failed authentication from ${clientIp}: ${authResult.error}`);
        this.sendAuthError(res, authResult, corsHeaders);
        return;
      }

      // Add authenticated key info to response headers
      if (authResult.keyId) {
        res.setHeader('X-Auth-Key-Id', authResult.keyId);
      }
    }

    // Route requests
    try {
      switch (pathname) {
        case WEB.ENDPOINTS.HEALTH:
          this.handleHealth(req, res, corsHeaders);
          break;
        case WEB.ENDPOINTS.METRICS:
          await this.handleMetrics(req, res, corsHeaders);
          break;
        case WEB.ENDPOINTS.SESSIONS:
          await this.handleSessions(req, res, corsHeaders);
          break;
        case WEB.ENDPOINTS.AGENTS:
          await this.handleAgents(req, res, corsHeaders);
          break;
        case WEB.ENDPOINTS.LOGS:
          await this.handleLogs(req, res, corsHeaders);
          break;
        case WEB.ENDPOINTS.STATUS:
          await this.handleStatus(req, res, corsHeaders);
          break;
        default:
          sendError(res, 404, 'Not found', corsHeaders);
      }
    } catch (err) {
      this.errorCount++;
      logger.error(`Web server error: ${err.message}`);
      sendError(res, 500, 'Internal server error', corsHeaders);
    }
  }

  /**
   * Handle health check endpoint
   * @param {http.IncomingMessage} req - HTTP request
   * @param {http.ServerResponse} res - HTTP response
   * @param {Object} corsHeaders - CORS headers
   */
  handleHealth(req, res, corsHeaders) {
    const health = this.getHealth();
    // Add rate limit info to health endpoint
    const rateLimitStatus = this.rateLimiter.getStatus(req);

    sendJson(res, 200, {
      ...health,
      rateLimit: {
        enabled: rateLimitStatus.enabled,
        limit: rateLimitStatus.limit,
      },
      auth: {
        enabled: this.apiKeyAuth.isEnabled(),
        scheme: this.apiKeyAuth.scheme,
        keyCount: this.apiKeyAuth.getKeyCount(),
      },
    }, corsHeaders);
  }

  /**
   * Handle metrics endpoint
   * @param {http.IncomingMessage} req - HTTP request
   * @param {http.ServerResponse} res - HTTP response
   * @param {Object} corsHeaders - CORS headers
   */
  async handleMetrics(req, res, corsHeaders) {
    if (!this.dataProvider) {
      sendError(res, 503, 'Data provider not available', corsHeaders);
      return;
    }

    try {
      const data = await this.dataProvider('metrics');
      sendJson(res, 200, {
        timestamp: new Date().toISOString(),
        metrics: data || {},
      }, corsHeaders);
    } catch (err) {
      logger.error(`Metrics error: ${err.message}`);
      sendError(res, 500, 'Failed to fetch metrics', corsHeaders);
    }
  }

  /**
   * Handle sessions endpoint
   * @param {http.IncomingMessage} req - HTTP request
   * @param {http.ServerResponse} res - HTTP response
   * @param {Object} corsHeaders - CORS headers
   */
  async handleSessions(req, res, corsHeaders) {
    if (!this.dataProvider) {
      sendError(res, 503, 'Data provider not available', corsHeaders);
      return;
    }

    try {
      const data = await this.dataProvider('sessions');
      sendJson(res, 200, {
        timestamp: new Date().toISOString(),
        sessions: data || [],
        count: data?.length || 0,
      }, corsHeaders);
    } catch (err) {
      logger.error(`Sessions error: ${err.message}`);
      sendError(res, 500, 'Failed to fetch sessions', corsHeaders);
    }
  }

  /**
   * Handle agents endpoint
   * @param {http.IncomingMessage} req - HTTP request
   * @param {http.ServerResponse} res - HTTP response
   * @param {Object} corsHeaders - CORS headers
   */
  async handleAgents(req, res, corsHeaders) {
    if (!this.dataProvider) {
      sendError(res, 503, 'Data provider not available', corsHeaders);
      return;
    }

    try {
      const data = await this.dataProvider('agents');
      sendJson(res, 200, {
        timestamp: new Date().toISOString(),
        agents: data || [],
        count: data?.length || 0,
      }, corsHeaders);
    } catch (err) {
      logger.error(`Agents error: ${err.message}`);
      sendError(res, 500, 'Failed to fetch agents', corsHeaders);
    }
  }

  /**
   * Handle logs endpoint
   * @param {http.IncomingMessage} req - HTTP request
   * @param {http.ServerResponse} res - HTTP response
   * @param {Object} corsHeaders - CORS headers
   */
  async handleLogs(req, res, corsHeaders) {
    if (!this.dataProvider) {
      sendError(res, 503, 'Data provider not available', corsHeaders);
      return;
    }

    try {
      const data = await this.dataProvider('logs');
      sendJson(res, 200, {
        timestamp: new Date().toISOString(),
        logs: data || [],
        count: data?.length || 0,
      }, corsHeaders);
    } catch (err) {
      logger.error(`Logs error: ${err.message}`);
      sendError(res, 500, 'Failed to fetch logs', corsHeaders);
    }
  }

  /**
   * Handle full status endpoint
   * @param {http.IncomingMessage} req - HTTP request
   * @param {http.ServerResponse} res - HTTP response
   * @param {Object} corsHeaders - CORS headers
   */
  async handleStatus(req, res, corsHeaders) {
    if (!this.dataProvider) {
      sendError(res, 503, 'Data provider not available', corsHeaders);
      return;
    }

    try {
      const [metrics, sessions, agents, logs] = await Promise.all([
        this.dataProvider('metrics'),
        this.dataProvider('sessions'),
        this.dataProvider('agents'),
        this.dataProvider('logs'),
      ]);

      sendJson(res, 200, {
        timestamp: new Date().toISOString(),
        health: this.getHealth(),
        metrics: metrics || {},
        sessions: sessions || [],
        agents: agents || [],
        logs: logs || [],
        summary: {
          sessionCount: sessions?.length || 0,
          agentCount: agents?.length || 0,
          logCount: logs?.length || 0,
        },
      }, corsHeaders);
    } catch (err) {
      logger.error(`Status error: ${err.message}`);
      sendError(res, 500, 'Failed to fetch status', corsHeaders);
    }
  }

  /**
   * Start the web server
   * @returns {Promise<WebServer>} This instance for chaining
   */
  async start() {
    return new Promise((resolve, reject) => {
      this.server = http.createServer((req, res) => this.handleRequest(req, res));

      this.server.on('error', (err) => {
        logger.error(`Web server error: ${err.message}`);
        reject(err);
      });

      this.server.listen(this.port, this.host, () => {
        const rateLimitStatus = this.rateLimiter.enabled ? 'enabled' : 'disabled';
        const corsStatus = this.corsManager.allowedOrigins === '*' ? 'allow-all' : 'restricted';
        const authStatus = this.apiKeyAuth.isEnabled() ? 'enabled' : 'disabled';
        logger.info(`Web server listening on http://${this.host}:${this.port} (rate-limit: ${rateLimitStatus}, cors: ${corsStatus}, auth: ${authStatus})`);
        resolve(this);
      });
    });
  }

  /**
   * Stop the web server
   * @returns {Promise<void>}
   */
  async stop() {
    if (!this.server) {
      return;
    }

    // Stop rate limiter cleanup
    this.rateLimiter.stop();

    return new Promise((resolve) => {
      this.server.close(() => {
        logger.info('Web server stopped');
        resolve();
      });
    });
  }

  /**
   * Get server info
   * @returns {Object} Server information
   */
  getInfo() {
    const rateLimitStatus = this.rateLimiter.getStatus({ headers: {}, socket: {} });

    return {
      host: this.host,
      port: this.port,
      url: `http://${this.host}:${this.port}`,
      endpoints: {
        health: `${WEB.ENDPOINTS.HEALTH}`,
        metrics: `${WEB.ENDPOINTS.METRICS}`,
        sessions: `${WEB.ENDPOINTS.SESSIONS}`,
        agents: `${WEB.ENDPOINTS.AGENTS}`,
        logs: `${WEB.ENDPOINTS.LOGS}`,
        status: `${WEB.ENDPOINTS.STATUS}`,
      },
      uptime: this.formatUptime(Date.now() - this.startTime),
      requests: this.requestCount,
      errors: this.errorCount,
      security: {
        rateLimit: {
          enabled: this.rateLimiter.enabled,
          windowMs: this.rateLimiter.windowMs,
          maxRequests: this.rateLimiter.maxRequests,
        },
        cors: {
          mode: this.corsManager.allowedOrigins === '*' ? 'allow-all' : 'restricted',
          credentials: this.corsManager.credentials,
        },
        auth: {
          enabled: this.apiKeyAuth.isEnabled(),
          scheme: this.apiKeyAuth.scheme,
          headerName: this.apiKeyAuth.headerName,
          activeKeys: this.apiKeyAuth.getKeyCount(),
        },
      },
    };
  }
}

export default WebServer;
export { WebRateLimiter, CorsManager };
