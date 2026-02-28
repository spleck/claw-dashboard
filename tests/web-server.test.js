/**
 * Tests for web server security features (rate limiting and CORS)
 */

import http from 'http';
import { WebServer, WebRateLimiter, CorsManager } from '../src/web-server.js';
import config from '../src/config.js';

describe('Web Server Security', () => {
  describe('WebRateLimiter', () => {
    let limiter;

    beforeEach(() => {
      limiter = new WebRateLimiter({
        enabled: true,
        windowMs: 60000,
        maxRequests: 5,
        trustProxy: false,
      });
    });

    afterEach(() => {
      limiter.stop();
    });

    describe('getClientIp', () => {
      test('should extract IP from socket remoteAddress', () => {
        const req = {
          socket: { remoteAddress: '192.168.1.1' },
          headers: {},
        };
        expect(limiter.getClientIp(req)).toBe('192.168.1.1');
      });

      test('should extract IP from connection remoteAddress', () => {
        const req = {
          connection: { remoteAddress: '192.168.1.2' },
          socket: null,
          headers: {},
        };
        expect(limiter.getClientIp(req)).toBe('192.168.1.2');
      });

      test('should use X-Forwarded-For when trustProxy is enabled', () => {
        limiter.trustProxy = true;
        const req = {
          socket: { remoteAddress: '192.168.1.1' },
          headers: { 'x-forwarded-for': '10.0.0.1, 10.0.0.2' },
        };
        expect(limiter.getClientIp(req)).toBe('10.0.0.1');
      });

      test('should use X-Real-IP when trustProxy is enabled', () => {
        limiter.trustProxy = true;
        const req = {
          socket: { remoteAddress: '192.168.1.1' },
          headers: { 'x-real-ip': '10.0.0.3' },
        };
        expect(limiter.getClientIp(req)).toBe('10.0.0.3');
      });

      test('should fall back to socket address when proxy headers missing', () => {
        limiter.trustProxy = true;
        const req = {
          socket: { remoteAddress: '192.168.1.1' },
          headers: {},
        };
        expect(limiter.getClientIp(req)).toBe('192.168.1.1');
      });

      test('should return unknown when no IP available', () => {
        const req = {
          socket: null,
          connection: null,
          headers: {},
        };
        expect(limiter.getClientIp(req)).toBe('unknown');
      });
    });

    describe('check', () => {
      test('should allow all requests when disabled', () => {
        limiter.enabled = false;
        const req = { socket: { remoteAddress: '192.168.1.1' }, headers: {} };

        for (let i = 0; i < 10; i++) {
          const result = limiter.check(req);
          expect(result.allowed).toBe(true);
        }
      });

      test('should allow requests under limit', () => {
        const req = { socket: { remoteAddress: '192.168.1.1' }, headers: {} };

        const result = limiter.check(req);
        expect(result.allowed).toBe(true);
        expect(result.remaining).toBe(5);
      });

      test('should track requests per IP separately', () => {
        const req1 = { socket: { remoteAddress: '192.168.1.1' }, headers: {} };
        const req2 = { socket: { remoteAddress: '192.168.1.2' }, headers: {} };

        // Fill up limiter for IP 1
        for (let i = 0; i < 5; i++) {
          limiter.record(req1);
        }

        // IP 1 should be blocked
        expect(limiter.check(req1).allowed).toBe(false);

        // IP 2 should still be allowed
        expect(limiter.check(req2).allowed).toBe(true);
      });

      test('should block requests over limit', () => {
        const req = { socket: { remoteAddress: '192.168.1.1' }, headers: {} };

        // Fill up limit
        for (let i = 0; i < 5; i++) {
          limiter.record(req);
        }

        const result = limiter.check(req);
        expect(result.allowed).toBe(false);
        expect(result.retryAfter).toBeGreaterThan(0);
        expect(result.ip).toBe('192.168.1.1');
      });

      test('should include retryAfter when blocked', () => {
        const req = { socket: { remoteAddress: '192.168.1.1' }, headers: {} };

        // Fill up limit
        for (let i = 0; i < 5; i++) {
          limiter.record(req);
        }

        const result = limiter.check(req);
        expect(result.retryAfter).toBeGreaterThanOrEqual(1);
        expect(result.retryAfter).toBeLessThanOrEqual(60);
      });
    });

    describe('record', () => {
      test('should not record when disabled', () => {
        limiter.enabled = false;
        const req = { socket: { remoteAddress: '192.168.1.1' }, headers: {} };

        limiter.record(req);
        limiter.record(req);
        limiter.record(req);

        const status = limiter.getStatus(req);
        expect(status.current).toBe(0);
      });

      test('should record request timestamp', () => {
        const req = { socket: { remoteAddress: '192.168.1.1' }, headers: {} };

        limiter.record(req);
        limiter.record(req);

        const status = limiter.getStatus(req);
        expect(status.current).toBe(2);
      });
    });

    describe('getStatus', () => {
      test('should return status when disabled', () => {
        limiter.enabled = false;
        const req = { socket: { remoteAddress: '192.168.1.1' }, headers: {} };

        const status = limiter.getStatus(req);
        expect(status.enabled).toBe(false);
        expect(status.limit).toBe(5);
        expect(status.remaining).toBe(5);
        expect(status.resetTime).toBe(null);
      });

      test('should return current count and remaining', () => {
        const req = { socket: { remoteAddress: '192.168.1.1' }, headers: {} };

        limiter.record(req);
        limiter.record(req);

        const status = limiter.getStatus(req);
        expect(status.enabled).toBe(true);
        expect(status.limit).toBe(5);
        expect(status.current).toBe(2);
        expect(status.remaining).toBe(3);
        expect(status.ip).toBe('192.168.1.1');
      });

      test('should return resetTime based on oldest request', () => {
        const req = { socket: { remoteAddress: '192.168.1.1' }, headers: {} };

        limiter.record(req);

        const status = limiter.getStatus(req);
        expect(status.resetTime).toBeTruthy();
        expect(new Date(status.resetTime).getTime()).toBeGreaterThan(Date.now());
      });
    });

    describe('cleanup', () => {
      test('should remove expired timestamps', async () => {
        limiter.windowMs = 100; // Short window for testing
        const req = { socket: { remoteAddress: '192.168.1.1' }, headers: {} };

        limiter.record(req);
        await new Promise(resolve => setTimeout(resolve, 150));

        limiter.cleanup();

        const status = limiter.getStatus(req);
        expect(status.current).toBe(0);
      });
    });
  });

  describe('CorsManager', () => {
    describe('isOriginAllowed', () => {
      test('should allow all origins with *', () => {
        const cors = new CorsManager({ allowedOrigins: '*' });
        expect(cors.isOriginAllowed('https://example.com')).toBe(true);
        expect(cors.isOriginAllowed('https://other.com')).toBe(true);
        expect(cors.isOriginAllowed(null)).toBe(true);
      });

      test('should allow exact match', () => {
        const cors = new CorsManager({ allowedOrigins: 'https://example.com' });
        expect(cors.isOriginAllowed('https://example.com')).toBe(true);
        expect(cors.isOriginAllowed('https://other.com')).toBe(false);
      });

      test('should allow from array of origins', () => {
        const cors = new CorsManager({
          allowedOrigins: ['https://example.com', 'https://other.com'],
        });
        expect(cors.isOriginAllowed('https://example.com')).toBe(true);
        expect(cors.isOriginAllowed('https://other.com')).toBe(true);
        expect(cors.isOriginAllowed('https://evil.com')).toBe(false);
      });

      test('should support wildcard patterns', () => {
        const cors = new CorsManager({
          allowedOrigins: ['https://*.example.com'],
        });
        expect(cors.isOriginAllowed('https://app.example.com')).toBe(true);
        expect(cors.isOriginAllowed('https://sub.app.example.com')).toBe(true);
        expect(cors.isOriginAllowed('https://other.com')).toBe(false);
      });

      test('should allow null origin (direct requests)', () => {
        const cors = new CorsManager({ allowedOrigins: ['https://example.com'] });
        expect(cors.isOriginAllowed(null)).toBe(true);
        expect(cors.isOriginAllowed(undefined)).toBe(true);
      });
    });

    describe('getHeaders', () => {
      test('should return correct CORS headers for allow-all', () => {
        const cors = new CorsManager({ allowedOrigins: '*' });
        const req = { headers: { origin: 'https://example.com' } };
        const headers = cors.getHeaders(req);

        expect(headers['Access-Control-Allow-Origin']).toBe('*');
        expect(headers['Access-Control-Allow-Methods']).toContain('GET');
        expect(headers['Access-Control-Allow-Methods']).toContain('POST');
        expect(headers['Content-Type']).toBe('application/json');
      });

      test('should mirror origin when credentials enabled with *', () => {
        const cors = new CorsManager({
          allowedOrigins: '*',
          credentials: true,
        });
        const req = { headers: { origin: 'https://example.com' } };
        const headers = cors.getHeaders(req);

        expect(headers['Access-Control-Allow-Origin']).toBe('https://example.com');
        expect(headers['Access-Control-Allow-Credentials']).toBe('true');
      });

      test('should include credentials header when enabled', () => {
        const cors = new CorsManager({
          allowedOrigins: 'https://example.com',
          credentials: true,
        });
        const req = { headers: { origin: 'https://example.com' } };
        const headers = cors.getHeaders(req);

        expect(headers['Access-Control-Allow-Credentials']).toBe('true');
      });

      test('should use configured methods and headers', () => {
        const cors = new CorsManager({
          allowedOrigins: '*',
          allowedMethods: ['GET', 'DELETE'],
          allowedHeaders: ['Content-Type', 'X-Custom-Header'],
          maxAge: 3600,
        });
        const req = { headers: {} };
        const headers = cors.getHeaders(req);

        expect(headers['Access-Control-Allow-Methods']).toBe('GET, DELETE');
        expect(headers['Access-Control-Allow-Headers']).toBe('Content-Type, X-Custom-Header');
        expect(headers['Access-Control-Max-Age']).toBe('3600');
      });

      test('should not include CORS headers for disallowed origin', () => {
        const cors = new CorsManager({ allowedOrigins: 'https://example.com' });
        const req = { headers: { origin: 'https://evil.com' } };
        const headers = cors.getHeaders(req);

        // Should not have Access-Control-Allow-Origin for disallowed origin
        expect(headers['Access-Control-Allow-Origin']).toBeUndefined();
      });
    });
  });

  describe('WebServer Integration', () => {
    let servers = [];

    afterEach(async () => {
      // Stop all servers
      for (const server of servers) {
        try {
          await server.stop();
        } catch (e) {
          // Ignore errors during cleanup
        }
      }
      servers = [];
      // Wait a bit for ports to be released
      await new Promise(resolve => setTimeout(resolve, 50));
    });

    test('should start server with rate limiting enabled', async () => {
      const server = new WebServer({
        port: 0, // Let OS assign port
        host: '127.0.0.1', // Bind to localhost only for tests
        rateLimit: {
          enabled: true,
          windowMs: 60000,
          maxRequests: 10,
        },
      });
      servers.push(server);

      await server.start();

      const info = server.getInfo();
      expect(info.security.rateLimit.enabled).toBe(true);
      expect(info.security.rateLimit.maxRequests).toBe(10);
    });

    test('should start server with restricted CORS', async () => {
      const server = new WebServer({
        port: 0,
        host: '127.0.0.1',
        corsOrigins: ['https://example.com'],
        corsCredentials: true,
      });
      servers.push(server);

      await server.start();

      const info = server.getInfo();
      expect(info.security.cors.mode).toBe('restricted');
      expect(info.security.cors.credentials).toBe(true);
    });

    test('should start server with allow-all CORS', async () => {
      const server = new WebServer({
        port: 0,
        host: '127.0.0.1',
        corsOrigins: '*',
      });
      servers.push(server);

      await server.start();

      const info = server.getInfo();
      expect(info.security.cors.mode).toBe('allow-all');
    });

    test('should track request and error counts', async () => {
      const server = new WebServer({
        port: 0,
        host: '127.0.0.1',
        rateLimit: {
          enabled: false, // Disable to avoid rate limiting in this test
          maxRequests: 5,
        },
      });
      servers.push(server);

      await server.start();
      const port = server.server.address().port;

      // Make a request to health endpoint
      await new Promise((resolve) => {
        http.get(`http://127.0.0.1:${port}/health`, (res) => {
          res.resume();
          res.on('end', resolve);
        }).on('error', resolve);
      });

      const info = server.getInfo();
      expect(info.requests).toBeGreaterThanOrEqual(1);
    });
  });

  describe('HTTP Endpoint Security', () => {
    let server;
    let port;

    beforeEach(async () => {
      server = new WebServer({
        port: 0,
        host: '127.0.0.1',
        rateLimit: {
          enabled: true,
          windowMs: 60000,
          maxRequests: 3,
        },
        corsOrigins: ['https://allowed.com'],
      });
      server.setDataProvider(async (type) => {
        if (type === 'metrics') return { cpu: 50 };
        if (type === 'sessions') return [];
        if (type === 'agents') return [];
        if (type === 'logs') return [];
        return null;
      });

      await server.start();
      port = server.server.address().port;
    });

    afterEach(async () => {
      if (server) {
        await server.stop();
        server = null;
      }
      // Wait for port release
      await new Promise(resolve => setTimeout(resolve, 50));
    });

    test('should return 429 when rate limit exceeded', async () => {
      const makeRequest = () => new Promise((resolve) => {
        http.get(`http://127.0.0.1:${port}/metrics`, (res) => {
          res.resume();
          resolve({ status: res.statusCode, headers: res.headers });
        }).on('error', () => resolve({ status: 0, headers: {} }));
      });

      // Make requests up to limit
      await makeRequest();
      await makeRequest();
      await makeRequest();

      // Next request should be rate limited
      const response = await makeRequest();

      expect(response.status).toBe(429);
      expect(response.headers['retry-after']).toBeDefined();
      expect(response.headers['x-ratelimit-remaining']).toBe('0');
    });

    test('should include rate limit headers on successful requests', async () => new Promise((resolve) => {
      http.get(`http://127.0.0.1:${port}/metrics`, (res) => {
        expect(res.statusCode).toBe(200);
        expect(res.headers['x-ratelimit-limit']).toBeDefined();
        expect(res.headers['x-ratelimit-remaining']).toBeDefined();
        res.resume();
        res.on('end', resolve);
      }).on('error', resolve);
    }));

    test('should return 403 for disallowed CORS origin', async () => {
      const options = {
        hostname: '127.0.0.1',
        port,
        path: '/metrics',
        method: 'GET',
        headers: {
          'Origin': 'https://evil.com',
        },
      };

      return new Promise((resolve) => {
        const req = http.request(options, (res) => {
          expect(res.statusCode).toBe(403);
          res.resume();
          res.on('end', resolve);
        });
        req.on('error', resolve);
        req.end();
      });
    });

    test('should allow request from allowed CORS origin', async () => {
      const options = {
        hostname: '127.0.0.1',
        port,
        path: '/metrics',
        method: 'GET',
        headers: {
          'Origin': 'https://allowed.com',
        },
      };

      return new Promise((resolve) => {
        const req = http.request(options, (res) => {
          expect(res.statusCode).toBe(200);
          expect(res.headers['access-control-allow-origin']).toBe('https://allowed.com');
          res.resume();
          res.on('end', resolve);
        });
        req.on('error', resolve);
        req.end();
      });
    });

    test('should handle CORS preflight requests', async () => {
      const options = {
        hostname: '127.0.0.1',
        port,
        path: '/metrics',
        method: 'OPTIONS',
        headers: {
          'Origin': 'https://allowed.com',
          'Access-Control-Request-Method': 'GET',
        },
      };

      return new Promise((resolve) => {
        const req = http.request(options, (res) => {
          expect(res.statusCode).toBe(200);
          expect(res.headers['access-control-allow-origin']).toBe('https://allowed.com');
          res.resume();
          res.on('end', resolve);
        });
        req.on('error', resolve);
        req.end();
      });
    });

    test('should skip rate limiting for health endpoint', async () => {
      // Make many requests to health endpoint
      for (let i = 0; i < 10; i++) {
        await new Promise((resolve) => {
          http.get(`http://127.0.0.1:${port}/health`, (res) => {
            expect(res.statusCode).toBe(200);
            res.resume();
            res.on('end', resolve);
          }).on('error', resolve);
        });
      }
    });

    test('health endpoint should include rate limit info', async () => {
      return new Promise((resolve) => {
        http.get(`http://127.0.0.1:${port}/health`, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            const body = JSON.parse(data);
            expect(body.rateLimit).toBeDefined();
            expect(body.rateLimit.enabled).toBe(true);
            expect(body.rateLimit.limit).toBe(3);
            resolve();
          });
        }).on('error', resolve);
      });
    });

    test('should track requests in server info', async () => {
      const initialInfo = server.getInfo();
      const initialRequests = initialInfo.requests;

      // Make a request to health endpoint
      await new Promise((resolve) => {
        http.get(`http://127.0.0.1:${port}/health`, (res) => {
          res.resume();
          res.on('end', resolve);
        }).on('error', resolve);
      });

      const info = server.getInfo();
      expect(info.requests).toBeGreaterThan(initialRequests);
    });

    test('should track errors in server info', async () => {
      const initialInfo = server.getInfo();
      const initialErrors = initialInfo.errors;

      // Trigger a rate limit error by exceeding the limit
      const makeRequest = () => new Promise((resolve) => {
        http.get(`http://127.0.0.1:${port}/metrics`, (res) => {
          res.resume();
          res.on('end', resolve);
        }).on('error', resolve);
      });

      // Make requests to exceed limit (maxRequests is 3)
      await makeRequest();
      await makeRequest();
      await makeRequest();
      await makeRequest(); // This one should trigger 429 and increment errorCount

      const info = server.getInfo();
      expect(info.errors).toBeGreaterThan(initialErrors);
    });
  });

  describe('Configuration', () => {
    test('should use default config values', () => {
      const server = new WebServer({});

      expect(server.rateLimiter.enabled).toBe(config.WEB.RATE_LIMIT.ENABLED);
      expect(server.rateLimiter.maxRequests).toBe(config.WEB.RATE_LIMIT.MAX_REQUESTS);
      expect(server.corsManager.allowedOrigins).toBe(config.WEB.CORS.ALLOWED_ORIGINS);
    });

    test('should override with custom options', () => {
      const server = new WebServer({
        rateLimit: {
          enabled: false,
          windowMs: 30000,
          maxRequests: 50,
        },
        corsOrigins: ['https://custom.com'],
        corsCredentials: true,
      });

      expect(server.rateLimiter.enabled).toBe(false);
      expect(server.rateLimiter.windowMs).toBe(30000);
      expect(server.rateLimiter.maxRequests).toBe(50);
      expect(server.corsManager.allowedOrigins).toEqual(['https://custom.com']);
      expect(server.corsManager.credentials).toBe(true);
    });
  });
});
