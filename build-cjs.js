#!/usr/bin/env node

/**
 * Build CJS wrappers for dual-package exports
 * Creates CJS versions of ESM modules for backward compatibility
 */

import * as esbuild from 'esbuild';
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Custom plugin to replace import.meta.url with a CJS-compatible version
const cjsImportMetaPlugin = {
  name: 'cjs-import-meta',
  setup(build) {
    // Filter only JS files
    const filter = /\.js$/;

    build.onLoad({ filter }, async (args) => {
      const contents = await readFileSync(args.path, 'utf8');

      // Replace import.meta.url with a CJS-compatible expression
      // We use process.cwd() as fallback since we can't know the actual file location
      const newContents = contents.replace(
        /import\.meta\.url/g,
        "'file://' + (typeof __dirname !== 'undefined' ? require('path').join(__dirname, 'index.js').replace(/\\\\/g, '/') : process.cwd() + '/index.js')"
      );

      return { contents: newContents, loader: 'js' };
    });
  },
};

// Build config for widgets CJS bundle
const widgetsCjsConfig = {
  entryPoints: ['src/widgets/index.js'],
  bundle: true,
  platform: 'node',
  target: 'node18',
  outfile: 'dist/widgets.cjs',
  format: 'cjs',
  external: ['blessed', 'blessed-contrib', 'systeminformation'],
  minify: false,
  sourcemap: false,
  plugins: [cjsImportMetaPlugin],
};

// Build config for main CJS bundle
const mainCjsConfig = {
  entryPoints: ['index.js'],
  bundle: true,
  platform: 'node',
  target: 'node18',
  outfile: 'index.cjs',
  format: 'cjs',
  external: ['blessed', 'blessed-contrib', 'systeminformation'],
  minify: false,
  sourcemap: false,
  plugins: [cjsImportMetaPlugin],
};

async function buildCjs(config, name) {
  console.log(`Building CJS ${name}...`);
  try {
    const result = await esbuild.build({
      ...config,
      write: false,
    });

    let output = result.outputFiles[0].text;

    // Extract shebang if present (must be at the very start)
    let shebang = '';
    const shebangMatch = output.match(/^#![^\n]*\n/);
    if (shebangMatch) {
      shebang = shebangMatch[0];
      output = output.slice(shebang.length);
    }

    // Also remove any shebang that might appear later in the file
    output = output.replace(/#![^\n]*\n/g, '');

    // Post-process: add __dirname polyfill at the start of the bundle
    const polyfill = `// Polyfill for __dirname in CJS bundle
var path = require('path');
var __filename = process.argv[1] || process.cwd() + '/index.js';
var __dirname = path.dirname(__filename);
`;

    // Add shebang first, then polyfill after 'use strict' if present
    if (output.startsWith('"use strict";')) {
      output = shebang + '"use strict";\n' + polyfill + output.slice('"use strict";'.length);
    } else {
      output = shebang + polyfill + output;
    }

    writeFileSync(config.outfile, output, { mode: 0o755 });
    console.log(`✓ CJS ${name} built: ${config.outfile}`);
    return true;
  } catch (error) {
    console.error(`✗ CJS ${name} build failed:`, error.message);
    return false;
  }
}

async function main() {
  // Ensure dist directory exists
  if (!existsSync('dist')) {
    mkdirSync('dist', { recursive: true });
  }

  const widgetsResult = await buildCjs(widgetsCjsConfig, 'widgets');
  const mainResult = await buildCjs(mainCjsConfig, 'main');

  if (widgetsResult && mainResult) {
    console.log('✓ All CJS builds completed');
    process.exit(0);
  } else {
    process.exit(1);
  }
}

main();
