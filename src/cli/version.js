/**
 * CLI Version Module
 * Displays version information for Claw Dashboard
 */

import { DASHBOARD_VERSION } from '../config.js';

/**
 * Display version information
 */
export function showVersion() {
  console.log(`clawdash ${DASHBOARD_VERSION}`);
}

export default { showVersion };
