#!/usr/bin/env node

/**
 * ESBuild configuration for claw-dashboard
 * Bundles the application for distribution
 */

import * as esbuild from 'esbuild';
import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Get current version from package.json
 * @returns {string} Current version
 */
function getVersion() {
  const pkg = JSON.parse(readFileSync(join(__dirname, 'package.json'), 'utf8'));
  return pkg.version;
}

/**
 * Create banner with version info
 * @returns {string} Banner comment
 */
function createBanner() {
  const version = getVersion();
  return `#!/usr/bin/env node
/**
 * claw-dashboard v${version}
 * A beautiful console dashboard for monitoring OpenClaw instances
 *
 * License: MIT
 * Repository: https://github.com/spleck/claw-dashboard
 */
`;
}

/**
 * Build configuration
 */
const buildConfig = {
  entryPoints: ['index.js'],
  bundle: true,
  platform: 'node',
  target: 'node18',
  outfile: 'dist/clawdash',
  format: 'esm',
  banner: {
    js: createBanner(),
  },
  // External dependencies that should not be bundled
  // (native modules, large dependencies, or things with dynamic requires)
  external: [
    'blessed',
    'blessed-contrib',
    'systeminformation',
  ],
  minify: true,
  sourcemap: false,
  metafile: true,
  logLevel: 'info',
};

/**
 * Development build configuration
 */
const devConfig = {
  ...buildConfig,
  minify: false,
  sourcemap: true,
  outfile: 'dist/clawdash.dev',
};

/**
 * Run build
 * @param {Object} config - Build configuration
 * @param {string} mode - Build mode (production or development)
 */
async function build(config, mode = 'production') {
  console.log(`Building for ${mode}...`);
  console.log(`Version: ${getVersion()}`);

  try {
    const result = await esbuild.build({
      ...config,
      write: false,
    });

    // Add shebang if not present and make executable
    let output = result.outputFiles[0].text;
    if (!output.startsWith('#!')) {
      output = '#!/usr/bin/env node\n' + output;
    }

    // Write the output file
    writeFileSync(config.outfile, output, { mode: 0o755 });

    // Write metafile for analysis
    if (result.metafile) {
      writeFileSync(
        config.outfile + '.meta.json',
        JSON.stringify(result.metafile, null, 2)
      );
    }

    // Calculate bundle size
    const bytes = Buffer.byteLength(output, 'utf8');
    const kb = (bytes / 1024).toFixed(2);

    console.log(`✓ Build successful: ${config.outfile} (${kb} KB)`);

    // Print bundle analysis
    if (result.metafile) {
      const outputs = result.metafile.outputs;
      const outputKey = Object.keys(outputs).find(k => k.endsWith('.js') || k.endsWith('clawdash'));
      if (outputKey) {
        const output = outputs[outputKey];
        console.log(`  - Bundle size: ${(output.bytes / 1024).toFixed(2)} KB`);
        console.log(`  - Exports: ${output.exports.join(', ')}`);
      }
    }

    return true;
  } catch (error) {
    console.error('✗ Build failed:', error.message);
    process.exit(1);
  }
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);
  const isDev = args.includes('--dev') || args.includes('-d');
  const shouldAnalyze = args.includes('--analyze') || args.includes('-a');

  const config = isDev ? devConfig : buildConfig;

  const success = await build(config, isDev ? 'development' : 'production');

  if (success && shouldAnalyze) {
    console.log('\nBundle analysis written to:', config.outfile + '.meta.json');
  }

  process.exit(success ? 0 : 1);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { build, buildConfig, devConfig };
