/**
 * Web Server Module for Claw Dashboard
 * Provides HTTP API for remote access to dashboard data
 */

import http from 'http';
import url from 'url';
import logger from './logger.js';
import config from './config.js';

const { WEB, DASHBOARD_VERSION } = config;

/**
 * Create CORS headers for HTTP responses
 * @returns {Object} CORS headers
 */
function getCorsHeaders() {
  return {
    'Access-Control-Allow-Origin': WEB.CORS_ORIGIN,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };
}

/**
 * Send JSON response
 * @param {http.ServerResponse} res - HTTP response
 * @param {number} statusCode - HTTP status code
 * @param {Object} data - Response data
 */
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, getCorsHeaders());
  res.end(JSON.stringify(data, null, 2));
}

/**
 * Send error response
 * @param {http.ServerResponse} res - HTTP response
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 */
function sendError(res, statusCode, message) {
  sendJson(res, statusCode, { error: message, status: statusCode });
}

/**
 * Web Server class for exposing dashboard data via HTTP API
 */
export class WebServer {
  constructor(options = {}) {
    this.port = options.port || WEB.DEFAULT_PORT;
    this.host = options.host || WEB.HOST;
    this.server = null;
    this.dataProvider = null;
    this.startTime = Date.now();
    this.requestCount = 0;
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
   * Handle incoming HTTP requests
   * @param {http.IncomingMessage} req - HTTP request
   * @param {http.ServerResponse} res - HTTP response
   */
  async handleRequest(req, res) {
    this.requestCount++;
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      res.writeHead(200, getCorsHeaders());
      res.end();
      return;
    }

    // Route requests
    try {
      switch (pathname) {
        case WEB.ENDPOINTS.HEALTH:
          this.handleHealth(req, res);
          break;
        case WEB.ENDPOINTS.METRICS:
          await this.handleMetrics(req, res);
          break;
        case WEB.ENDPOINTS.SESSIONS:
          await this.handleSessions(req, res);
          break;
        case WEB.ENDPOINTS.AGENTS:
          await this.handleAgents(req, res);
          break;
        case WEB.ENDPOINTS.LOGS:
          await this.handleLogs(req, res);
          break;
        case WEB.ENDPOINTS.STATUS:
          await this.handleStatus(req, res);
          break;
        default:
          sendError(res, 404, 'Not found');
      }
    } catch (err) {
      logger.error(`Web server error: ${err.message}`);
      sendError(res, 500, 'Internal server error');
    }
  }

  /**
   * Handle health check endpoint
   */
  handleHealth(req, res) {
    sendJson(res, 200, this.getHealth());
  }

  /**
   * Handle metrics endpoint
   */
  async handleMetrics(req, res) {
    if (!this.dataProvider) {
      sendError(res, 503, 'Data provider not available');
      return;
    }

    try {
      const data = await this.dataProvider('metrics');
      sendJson(res, 200, {
        timestamp: new Date().toISOString(),
        metrics: data || {},
      });
    } catch (err) {
      logger.error(`Metrics error: ${err.message}`);
      sendError(res, 500, 'Failed to fetch metrics');
    }
  }

  /**
   * Handle sessions endpoint
   */
  async handleSessions(req, res) {
    if (!this.dataProvider) {
      sendError(res, 503, 'Data provider not available');
      return;
    }

    try {
      const data = await this.dataProvider('sessions');
      sendJson(res, 200, {
        timestamp: new Date().toISOString(),
        sessions: data || [],
        count: data?.length || 0,
      });
    } catch (err) {
      logger.error(`Sessions error: ${err.message}`);
      sendError(res, 500, 'Failed to fetch sessions');
    }
  }

  /**
   * Handle agents endpoint
   */
  async handleAgents(req, res) {
    if (!this.dataProvider) {
      sendError(res, 503, 'Data provider not available');
      return;
    }

    try {
      const data = await this.dataProvider('agents');
      sendJson(res, 200, {
        timestamp: new Date().toISOString(),
        agents: data || [],
        count: data?.length || 0,
      });
    } catch (err) {
      logger.error(`Agents error: ${err.message}`);
      sendError(res, 500, 'Failed to fetch agents');
    }
  }

  /**
   * Handle logs endpoint
   */
  async handleLogs(req, res) {
    if (!this.dataProvider) {
      sendError(res, 503, 'Data provider not available');
      return;
    }

    try {
      const data = await this.dataProvider('logs');
      sendJson(res, 200, {
        timestamp: new Date().toISOString(),
        logs: data || [],
        count: data?.length || 0,
      });
    } catch (err) {
      logger.error(`Logs error: ${err.message}`);
      sendError(res, 500, 'Failed to fetch logs');
    }
  }

  /**
   * Handle full status endpoint
   */
  async handleStatus(req, res) {
    if (!this.dataProvider) {
      sendError(res, 503, 'Data provider not available');
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
      });
    } catch (err) {
      logger.error(`Status error: ${err.message}`);
      sendError(res, 500, 'Failed to fetch status');
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
        logger.info(`Web server listening on http://${this.host}:${this.port}`);
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
    };
  }
}

export default WebServer;
