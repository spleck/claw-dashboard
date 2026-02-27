/**
 * Checksum verification utilities for OpenClaw gateway responses
 * Provides integrity verification for data received from gateway endpoints
 */

import crypto from 'crypto';
import config from './config.js';
import logger from './logger.js';

/**
 * Supported hash algorithms
 * @typedef {'sha256' | 'sha512' | 'md5'} HashAlgorithm
 */

const SUPPORTED_ALGORITHMS = ['sha256', 'sha512', 'md5'];

/**
 * Compute checksum of data using specified algorithm
 * @param {string|Buffer} data - Data to compute checksum for
 * @param {HashAlgorithm} [algorithm] - Hash algorithm to use (defaults to config)
 * @returns {string} - Computed checksum in hex format
 */
export function computeChecksum(data, algorithm = null) {
  const algo = algorithm || config.CHECKSUM.ALGORITHM;

  if (!SUPPORTED_ALGORITHMS.includes(algo)) {
    throw new Error(`Unsupported hash algorithm: ${algo}. Supported: ${SUPPORTED_ALGORITHMS.join(', ')}`);
  }

  const hash = crypto.createHash(algo);
  hash.update(data);
  return hash.digest('hex');
}

/**
 * Verify response checksum against computed checksum
 * @param {string|Buffer} data - Response body data
 * @param {string} expectedChecksum - Expected checksum from header
 * @param {HashAlgorithm} [algorithm] - Hash algorithm to use
 * @returns {boolean} - True if checksums match
 */
export function verifyChecksum(data, expectedChecksum, algorithm = null) {
  if (!expectedChecksum) {
    return false;
  }

  try {
    const computed = computeChecksum(data, algorithm);
    // Use timing-safe comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(computed, 'hex'),
      Buffer.from(expectedChecksum, 'hex')
    );
  } catch (err) {
    logger.debug(`Checksum verification failed: ${err.message}`);
    return false;
  }
}

/**
 * Verify HTTP response checksum from header
 * @param {http.IncomingMessage} response - HTTP response object
 * @param {string} responseBody - Response body as string
 * @returns {{verified: boolean, checksum: string|null, error: string|null}} - Verification result
 */
export function verifyResponseChecksum(response, responseBody) {
  if (!config.CHECKSUM.ENABLED) {
    return { verified: true, checksum: null, error: null };
  }

  const headerName = config.CHECKSUM.HEADER_NAME.toLowerCase();
  const expectedChecksum = response.headers[headerName];

  // Check if response has checksum header
  if (!expectedChecksum) {
    if (config.CHECKSUM.STRICT_MODE) {
      return {
        verified: false,
        checksum: null,
        error: `Missing ${config.CHECKSUM.HEADER_NAME} header (strict mode enabled)`
      };
    }
    // Non-strict mode: accept responses without checksum
    return { verified: true, checksum: null, error: null };
  }

  // Validate checksum format (hex string)
  const checksumStr = Array.isArray(expectedChecksum) ? expectedChecksum[0] : expectedChecksum;
  if (!/^[a-f0-9]+$/i.test(checksumStr)) {
    return {
      verified: false,
      checksum: checksumStr,
      error: 'Invalid checksum format: expected hex string'
    };
  }

  // Verify checksum
  const isValid = verifyChecksum(responseBody, checksumStr);

  if (!isValid) {
    return {
      verified: false,
      checksum: checksumStr,
      error: 'Checksum mismatch: computed checksum does not match header'
    };
  }

  return { verified: true, checksum: checksumStr, error: null };
}

/**
 * Get checksum metadata for logging/debugging
 * @param {http.IncomingMessage} response - HTTP response object
 * @returns {Object} - Checksum metadata
 */
export function getChecksumMetadata(response) {
  const headerName = config.CHECKSUM.HEADER_NAME.toLowerCase();
  const checksum = response.headers[headerName];

  return {
    algorithm: config.CHECKSUM.ALGORITHM,
    headerName: config.CHECKSUM.HEADER_NAME,
    headerPresent: !!checksum,
    checksum: checksum || null,
    strictMode: config.CHECKSUM.STRICT_MODE,
    enabled: config.CHECKSUM.ENABLED,
  };
}

/**
 * Check if an error is a checksum verification failure
 * @param {Error} error - Error to check
 * @returns {boolean} - True if checksum verification error
 */
export function isChecksumError(error) {
  return error && error.code === 'CHECKSUM_ERROR';
}

export default {
  computeChecksum,
  verifyChecksum,
  verifyResponseChecksum,
  getChecksumMetadata,
  isChecksumError,
  SUPPORTED_ALGORITHMS,
};
