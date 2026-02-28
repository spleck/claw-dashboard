import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';
import os from 'os';
import { execSync } from 'child_process';

const CLI_PATH = join(process.cwd(), 'index.js');

describe('validate-plugin CLI', () => {
  let tempDir;
  let pluginDir;

  beforeEach(() => {
    tempDir = mkdtempSync(join(os.tmpdir(), 'validate-plugin-test-'));
    pluginDir = join(tempDir, 'test-widget');
    mkdirSync(pluginDir, { recursive: true });
  });

  afterEach(() => {
    try {
      rmSync(tempDir, { recursive: true, force: true });
    } catch {}
  });

  const runCli = (args) => {
    try {
      const output = execSync(`node ${CLI_PATH} ${args}`, {
        encoding: 'utf8',
        cwd: process.cwd(),
      });
      return { exitCode: 0, output, stderr: '' };
    } catch (error) {
      return {
        exitCode: error.status || 1,
        output: error.stdout || '',
        stderr: error.stderr || error.message,
      };
    }
  };

  describe('help', () => {
    test('shows help with --help', () => {
      const result = runCli('validate-plugin --help');
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain('Validate Plugin Manifest');
      expect(result.output).toContain('Usage:');
      expect(result.output).toContain('Options:');
      expect(result.output).toContain('--json');
    });

    test('shows help with -h', () => {
      const result = runCli('validate-plugin -h');
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain('Validate Plugin Manifest');
    });
  });

  describe('validation', () => {
    test('returns error when no path provided', () => {
      const result = runCli('validate-plugin');
      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('required');
    });

    test('returns error for non-existent path', () => {
      const result = runCli('validate-plugin /nonexistent/path/12345');
      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('does not exist');
    });

    test('returns error for directory without plugin.json', () => {
      const result = runCli(`validate-plugin ${pluginDir}`);
      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('No plugin.json found');
    });
  });

  describe('valid manifests', () => {
    test('validates a valid plugin.json file', () => {
      const validManifest = {
        id: 'test-widget',
        name: 'Test Widget',
        version: '1.0.0',
        type: 'widget',
        category: 'custom',
      };
      const manifestPath = join(pluginDir, 'plugin.json');
      writeFileSync(manifestPath, JSON.stringify(validManifest, null, 2));

      const result = runCli(`validate-plugin ${manifestPath}`);
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain('Valid plugin manifest');
      expect(result.output).toContain('test-widget');
      expect(result.output).toContain('Test Widget');
    });

    test('validates a valid plugin directory', () => {
      const validManifest = {
        id: 'test-widget',
        name: 'Test Widget',
        version: '1.0.0',
        type: 'widget',
        category: 'custom',
      };
      writeFileSync(join(pluginDir, 'plugin.json'), JSON.stringify(validManifest, null, 2));

      const result = runCli(`validate-plugin ${pluginDir}`);
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain('Valid plugin manifest');
    });

    test('accepts full manifest with all fields', () => {
      const fullManifest = {
        id: 'system-metrics',
        name: 'System Metrics',
        description: 'Shows system metrics',
        version: '2.1.0-beta.1',
        author: 'Test Author <test@example.com>',
        category: 'system',
        type: 'widget',
        lazyLoad: true,
        priority: 50,
        config: {
          refreshInterval: 5000,
          maxDataPoints: 30,
        },
        permissions: ['network', 'system'],
        dependencies: ['base-widget'],
        __version: 1,
      };
      writeFileSync(join(pluginDir, 'plugin.json'), JSON.stringify(fullManifest, null, 2));

      const result = runCli(`validate-plugin ${pluginDir}`);
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain('Valid plugin manifest');
      expect(result.output).toContain('system-metrics');
    });
  });

  describe('invalid manifests', () => {
    test('detects missing required fields', () => {
      const invalidManifest = {
        name: 'Test Widget',
        // missing id, version, type
      };
      writeFileSync(join(pluginDir, 'plugin.json'), JSON.stringify(invalidManifest, null, 2));

      const result = runCli(`validate-plugin ${pluginDir}`);
      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('Invalid');
      expect(result.stderr).toContain('Errors:');
    });

    test('detects invalid id format', () => {
      const invalidManifest = {
        id: '_invalid-id',
        name: 'Test',
        version: '1.0.0',
        type: 'widget',
      };
      writeFileSync(join(pluginDir, 'plugin.json'), JSON.stringify(invalidManifest, null, 2));

      const result = runCli(`validate-plugin ${pluginDir}`);
      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('Invalid');
    });

    test('detects invalid semver version', () => {
      const invalidManifest = {
        id: 'test-widget',
        name: 'Test',
        version: 'not-a-version',
        type: 'widget',
      };
      writeFileSync(join(pluginDir, 'plugin.json'), JSON.stringify(invalidManifest, null, 2));

      const result = runCli(`validate-plugin ${pluginDir}`);
      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('semantic version');
    });

    test('detects invalid type', () => {
      const invalidManifest = {
        id: 'test-widget',
        name: 'Test',
        version: '1.0.0',
        type: 'invalid-type',
      };
      writeFileSync(join(pluginDir, 'plugin.json'), JSON.stringify(invalidManifest, null, 2));

      const result = runCli(`validate-plugin ${pluginDir}`);
      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('widget');
    });

    test('detects invalid category', () => {
      const invalidManifest = {
        id: 'test-widget',
        name: 'Test',
        version: '1.0.0',
        type: 'widget',
        category: 'invalid-category',
      };
      writeFileSync(join(pluginDir, 'plugin.json'), JSON.stringify(invalidManifest, null, 2));

      const result = runCli(`validate-plugin ${pluginDir}`);
      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('custom');
    });

    test('detects priority out of range', () => {
      const invalidManifest = {
        id: 'test-widget',
        name: 'Test',
        version: '1.0.0',
        type: 'widget',
        priority: 2000,
      };
      writeFileSync(join(pluginDir, 'plugin.json'), JSON.stringify(invalidManifest, null, 2));

      const result = runCli(`validate-plugin ${pluginDir}`);
      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('at most');
    });
  });

  describe('json output', () => {
    test('outputs valid result as JSON with --json', () => {
      const validManifest = {
        id: 'test-widget',
        name: 'Test Widget',
        version: '1.0.0',
        type: 'widget',
      };
      writeFileSync(join(pluginDir, 'plugin.json'), JSON.stringify(validManifest, null, 2));

      const result = runCli(`validate-plugin ${pluginDir} --json`);
      expect(result.exitCode).toBe(0);
      const json = JSON.parse(result.output);
      expect(json.valid).toBe(true);
      expect(json.id).toBe('test-widget');
      expect(json.name).toBe('Test Widget');
      expect(json.version).toBe('1.0.0');
    });

    test('outputs invalid result as JSON with -j', () => {
      const invalidManifest = {
        id: 'test-widget',
        // missing required fields
      };
      writeFileSync(join(pluginDir, 'plugin.json'), JSON.stringify(invalidManifest, null, 2));

      const result = runCli(`validate-plugin ${pluginDir} -j`);
      expect(result.exitCode).toBe(1);
      const json = JSON.parse(result.output);
      expect(json.valid).toBe(false);
      expect(json.errors).toBeDefined();
      expect(json.errors.length).toBeGreaterThan(0);
    });

    test('includes path in JSON output', () => {
      const validManifest = {
        id: 'test-widget',
        name: 'Test Widget',
        version: '1.0.0',
        type: 'widget',
      };
      writeFileSync(join(pluginDir, 'plugin.json'), JSON.stringify(validManifest, null, 2));

      const result = runCli(`validate-plugin ${pluginDir} --json`);
      const json = JSON.parse(result.output);
      expect(json.path).toContain('test-widget');
      expect(json.path).toContain('plugin.json');
    });
  });

  describe('path handling', () => {
    test('handles absolute paths', () => {
      const validManifest = {
        id: 'test-widget',
        name: 'Test Widget',
        version: '1.0.0',
        type: 'widget',
      };
      writeFileSync(join(pluginDir, 'plugin.json'), JSON.stringify(validManifest, null, 2));

      const result = runCli(`validate-plugin ${pluginDir}/plugin.json`);
      expect(result.exitCode).toBe(0);
    });

    test('handles ~ in path', () => {
      const validManifest = {
        id: 'test-widget',
        name: 'Test Widget',
        version: '1.0.0',
        type: 'widget',
      };
      const homePluginDir = join(os.homedir(), '.openclaw', 'plugins', 'test-widget');
      mkdirSync(homePluginDir, { recursive: true });
      writeFileSync(join(homePluginDir, 'plugin.json'), JSON.stringify(validManifest, null, 2));

      const result = runCli('validate-plugin ~/.openclaw/plugins/test-widget');
      expect(result.exitCode).toBe(0);

      // Cleanup
      try {
        rmSync(join(os.homedir(), '.openclaw', 'plugins', 'test-widget'), { recursive: true, force: true });
      } catch {}
    });
  });

  describe('edge cases', () => {
    test('handles invalid JSON', () => {
      writeFileSync(join(pluginDir, 'plugin.json'), 'not valid json {');

      const result = runCli(`validate-plugin ${pluginDir}`);
      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('parse');
    });

    test('handles empty JSON object', () => {
      writeFileSync(join(pluginDir, 'plugin.json'), '{}');

      const result = runCli(`validate-plugin ${pluginDir}`);
      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('Errors:');
    });

    test('handles file instead of directory for path with ~', () => {
      // This test ensures path resolution works correctly
      const validManifest = {
        id: 'test-widget',
        name: 'Test Widget',
        version: '1.0.0',
        type: 'widget',
      };
      writeFileSync(join(pluginDir, 'plugin.json'), JSON.stringify(validManifest, null, 2));

      const result = runCli(`validate-plugin ${pluginDir}/plugin.json`);
      expect(result.exitCode).toBe(0);
    });

    test('validates multiple errors at once', () => {
      const invalidManifest = {
        id: 'test',
        name: '',
        version: 'invalid',
        type: 'wrong',
        category: 'bad',
        priority: -5,
      };
      writeFileSync(join(pluginDir, 'plugin.json'), JSON.stringify(invalidManifest, null, 2));

      const result = runCli(`validate-plugin ${pluginDir} --json`);
      expect(result.exitCode).toBe(1);
      const json = JSON.parse(result.output);
      expect(json.errors.length).toBeGreaterThan(1);
    });
  });
});
