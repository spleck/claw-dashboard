/**
 * Worker thread for heavy system information gathering
 * Offloads CPU-intensive systeminformation calls from the main thread
 * to keep the dashboard UI responsive
 */

import { parentPort, isMainThread, workerData } from 'worker_threads';
import logger from '../logger.js';

// Systeminformation module (dynamically imported)
let si = null;

/**
 * Initialize the systeminformation module
 */
async function initSystemInfo() {
  if (!si) {
    const module = await import('systeminformation');
    si = module.default || module;
  }
  return si;
}

/**
 * Execute a systeminformation command
 * @param {string} command - Command to execute
 * @param {Object} options - Command options
 * @returns {Promise<any>} Command result
 */
async function executeCommand(command, options = {}) {
  const systemInfo = await initSystemInfo();

  switch (command) {
    case 'currentLoad':
      return await systemInfo.currentLoad();

    case 'mem':
      return await systemInfo.mem();

    case 'graphics':
      return await systemInfo.graphics();

    case 'networkStats':
      return await systemInfo.networkStats();

    case 'fsSize':
      return await systemInfo.fsSize();

    case 'osInfo':
      return await systemInfo.osInfo();

    case 'versions':
      return await systemInfo.versions();

    case 'time':
      return await systemInfo.time();

    case 'systemData':
      // Fetch multiple system data in parallel
      const [os, ver, time] = await Promise.all([
        systemInfo.osInfo(),
        systemInfo.versions(),
        systemInfo.time(),
      ]);
      return { os, ver, time };

    case 'processes':
      return await systemInfo.processes();

    case 'diskLayout':
      return await systemInfo.diskLayout();

    case 'battery':
      return await systemInfo.battery();

    case 'users':
      return await systemInfo.users();

    default:
      throw new Error(`Unknown command: ${command}`);
  }
}

/**
 * Handle messages from the main thread
 */
if (!isMainThread && parentPort) {
  parentPort.on('message', async (message) => {
    const { id, command, options } = message;

    try {
      const startTime = Date.now();
      const result = await executeCommand(command, options);
      const duration = Date.now() - startTime;

      // Send successful result back to main thread
      parentPort.postMessage({
        id,
        success: true,
        data: result,
        duration,
      });
    } catch (error) {
      // Send error back to main thread
      parentPort.postMessage({
        id,
        success: false,
        error: error.message,
        stack: error.stack,
      });
    }
  });

  // Signal that worker is ready
  parentPort.postMessage({ type: 'ready' });
}

/**
 * Worker thread entry point validation
 * Prevents accidental execution in main thread
 */
if (isMainThread) {
  // This file should only be run as a worker thread
  // Export a marker for the main thread to detect
  export const IS_WORKER_THREAD_MODULE = true;
}

export default {
  IS_WORKER_THREAD_MODULE: true,
};
