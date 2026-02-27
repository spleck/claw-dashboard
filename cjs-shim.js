// CJS shim for import.meta.url polyfill
// This file is injected into CJS builds to provide __dirname

const path = require('path');
const { fileURLToPath } = require('url');

// Check if we're in a bundled environment or regular CJS
if (typeof __filename === 'undefined') {
  // In bundled CJS, process.cwd() is used
  global.__dirname = path.dirname(process.execPath);
} else {
  global.__dirname = path.dirname(__filename);
}
