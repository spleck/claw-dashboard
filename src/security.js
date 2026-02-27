/**
 * Security utilities for file permissions
 */

import fs from 'fs';
import path from 'path';

/**
 * Validate that a file path is safe (no null bytes, proper type)
 * @param {string} filePath - Path to validate
 * @returns {boolean} - True if path is valid
 */
function isValidPath(filePath) {
  if (!filePath || typeof filePath !== 'string') return false;
  // Check for null bytes which can indicate injection attempts
  if (filePath.includes('\0')) return false;
  // Check for valid length
  if (filePath.length === 0 || filePath.length > 4096) return false;
  return true;
}

/**
 * Check if path is a regular file (not symlink) before chmod
 * @param {string} filePath - Path to check
 * @returns {Promise<boolean>} - True if safe to chmod
 */
async function isSafeToChmod(filePath) {
  try {
    const stats = await fs.promises.lstat(filePath);
    // Only chmod regular files, not symlinks or directories
    if (!stats.isFile() || stats.isSymbolicLink()) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Set secure file permissions (0600 - owner read/write only)
 * @param {string} filePath - Path to the file
 * @returns {Promise<boolean>} - True if successful, false on failure
 */
async function setSecurePermissions(filePath) {
  if (!isValidPath(filePath)) {
    console.error('Invalid file path provided for permission setting');
    return false;
  }

  // Check if path is safe (not a symlink)
  if (!await isSafeToChmod(filePath)) {
    console.error(`Cannot set permissions on non-file path: ${filePath}`);
    return false;
  }

  try {
    await fs.promises.chmod(filePath, 0o600);
    return true;
  } catch (err) {
    // Graceful fallback - log but don't crash
    console.error(`Failed to set permissions on ${filePath}: ${err.message}`);
    return false;
  }
}

/**
 * Check if path is a regular file (synchronous version)
 * @param {string} filePath - Path to check
 * @returns {boolean} - True if safe to chmod
 */
function isSafeToChmodSync(filePath) {
  try {
    const stats = fs.lstatSync(filePath);
    // Only chmod regular files, not symlinks or directories
    if (!stats.isFile() || stats.isSymbolicLink()) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Set secure file permissions (synchronous version)
 * @param {string} filePath - Path to the file
 * @returns {boolean} - True if successful, false on failure
 */
function setSecurePermissionsSync(filePath) {
  if (!isValidPath(filePath)) {
    console.error('Invalid file path provided for permission setting');
    return false;
  }

  // Check if path is safe (not a symlink)
  if (!isSafeToChmodSync(filePath)) {
    console.error(`Cannot set permissions on non-file path: ${filePath}`);
    return false;
  }

  try {
    fs.chmodSync(filePath, 0o600);
    return true;
  } catch (err) {
    // Graceful fallback - log but don't crash
    console.error(`Failed to set permissions on ${filePath}: ${err.message}`);
    return false;
  }
}

export { setSecurePermissions, setSecurePermissionsSync, isValidPath, isSafeToChmod, isSafeToChmodSync };
export default { setSecurePermissions, setSecurePermissionsSync, isValidPath, isSafeToChmod, isSafeToChmodSync };
