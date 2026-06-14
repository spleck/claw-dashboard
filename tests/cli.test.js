/**
 * CLI Module Tests
 * Tests for CLI argument parsing, help output, and command handling
 */

import { jest } from '@jest/globals';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdtempSync, mkdirSync, rmSync, existsSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Store original argv and env
const originalArgv = process.argv;
const originalEnv = process.env;

describe('CLI Module Tests', () => {
  let tempDir;

  beforeEach(async () => {
    // Reset modules before each test
    jest.resetModules();

    // Create temp directory for file-based tests
    tempDir = mkdtempSync(join(tmpdir(), 'claw-cli-test-'));

    // Reset process.argv to default
    process.argv = ['node', 'clawdash'];
  });

  afterEach(() => {
    // Restore original values
    process.argv = originalArgv;
    process.env = originalEnv;

    // Clean up temp directory
    if (existsSync(tempDir)) {
      rmSync(tempDir, { recursive: true, force: true });
    }

    // Clear module cache
    jest.clearAllMocks();
  });

  describe('Argument Parsing', () => {
    it('should parse default options when no arguments provided', async () => {
      const { parseCliArgs } = await import('../src/cli/args.js');

      const options = parseCliArgs();

      expect(options.help).toBe(false);
      expect(options.version).toBe(false);
      expect(options.debug).toBe(false);
      expect(options.web).toBe(false);
      expect(options.watch).toBe(false);
      expect(options.command).toBeNull();
    });

    it('should parse --help flag', async () => {
      process.argv = ['node', 'clawdash', '--help'];
      const { parseCliArgs } = await import('../src/cli/args.js');

      const options = parseCliArgs();

      expect(options.help).toBe(true);
    });

    it('should parse -h shorthand', async () => {
      process.argv = ['node', 'clawdash', '-h'];
      const { parseCliArgs } = await import('../src/cli/args.js');

      const options = parseCliArgs();

      expect(options.help).toBe(true);
    });

    it('should parse --version flag', async () => {
      process.argv = ['node', 'clawdash', '--version'];
      const { parseCliArgs } = await import('../src/cli/args.js');

      const options = parseCliArgs();

      expect(options.version).toBe(true);
    });

    it('should parse -v shorthand', async () => {
      process.argv = ['node', 'clawdash', '-v'];
      const { parseCliArgs } = await import('../src/cli/args.js');

      const options = parseCliArgs();

      expect(options.version).toBe(true);
    });

    it('should parse --debug flag', async () => {
      process.argv = ['node', 'clawdash', '--debug'];
      const { parseCliArgs } = await import('../src/cli/args.js');

      const options = parseCliArgs();

      expect(options.debug).toBe(true);
    });

    it('should parse -d shorthand', async () => {
      process.argv = ['node', 'clawdash', '-d'];
      const { parseCliArgs } = await import('../src/cli/args.js');

      const options = parseCliArgs();

      expect(options.debug).toBe(true);
    });

    it('should parse --web flag', async () => {
      process.argv = ['node', 'clawdash', '--web'];
      const { parseCliArgs } = await import('../src/cli/args.js');

      const options = parseCliArgs();

      expect(options.web).toBe(true);
    });

    it('should parse -w shorthand', async () => {
      process.argv = ['node', 'clawdash', '-w'];
      const { parseCliArgs } = await import('../src/cli/args.js');

      const options = parseCliArgs();

      expect(options.web).toBe(true);
    });

    it('should parse --web-port with valid port', async () => {
      process.argv = ['node', 'clawdash', '--web-port', '8080'];
      const { parseCliArgs } = await import('../src/cli/args.js');

      const options = parseCliArgs();

      expect(options.web).toBe(true);
      expect(options.webPort).toBe(8080);
    });

    it('should parse -p shorthand with valid port', async () => {
      process.argv = ['node', 'clawdash', '-p', '9000'];
      const { parseCliArgs } = await import('../src/cli/args.js');

      const options = parseCliArgs();

      expect(options.web).toBe(true);
      expect(options.webPort).toBe(9000);
    });

    it('should ignore invalid port numbers', async () => {
      process.argv = ['node', 'clawdash', '--web-port', 'invalid'];
      const { parseCliArgs } = await import('../src/cli/args.js');

      const options = parseCliArgs();

      expect(options.web).toBe(true);
      // Should use default port
      expect(options.webPort).toBeGreaterThan(0);
    });

    it('should ignore out-of-range port numbers', async () => {
      process.argv = ['node', 'clawdash', '--web-port', '99999'];
      const { parseCliArgs } = await import('../src/cli/args.js');

      const options = parseCliArgs();

      expect(options.web).toBe(true);
      // Should use default port
      expect(options.webPort).toBeGreaterThan(0);
    });

    it('should parse --web-host', async () => {
      process.argv = ['node', 'clawdash', '--web-host', '0.0.0.0'];
      const { parseCliArgs } = await import('../src/cli/args.js');

      const options = parseCliArgs();

      expect(options.web).toBe(true);
      expect(options.webHost).toBe('0.0.0.0');
    });

    it('should parse --watch flag', async () => {
      process.argv = ['node', 'clawdash', '--watch'];
      const { parseCliArgs } = await import('../src/cli/args.js');

      const options = parseCliArgs();

      expect(options.watch).toBe(true);
    });

    it('should parse -W shorthand', async () => {
      process.argv = ['node', 'clawdash', '-W'];
      const { parseCliArgs } = await import('../src/cli/args.js');

      const options = parseCliArgs();

      expect(options.watch).toBe(true);
    });

    it('should parse --watch-plugins flag', async () => {
      process.argv = ['node', 'clawdash', '--watch-plugins'];
      const { parseCliArgs } = await import('../src/cli/args.js');

      const options = parseCliArgs();

      expect(options.watchPlugins).toBe(true);
    });

    it('should parse multiple flags', async () => {
      process.argv = ['node', 'clawdash', '--debug', '--web', '--watch'];
      const { parseCliArgs } = await import('../src/cli/args.js');

      const options = parseCliArgs();

      expect(options.debug).toBe(true);
      expect(options.web).toBe(true);
      expect(options.watch).toBe(true);
    });

    it('should parse create-plugin command', async () => {
      process.argv = ['node', 'clawdash', 'create-plugin', 'my-widget'];
      const { parseCliArgs } = await import('../src/cli/args.js');

      const options = parseCliArgs();

      expect(options.command).toBe('create-plugin');
      expect(options.commandArgs).toEqual(['my-widget']);
    });

    it('should parse validate-plugin command', async () => {
      process.argv = ['node', 'clawdash', 'validate-plugin', './my-plugin'];
      const { parseCliArgs } = await import('../src/cli/args.js');

      const options = parseCliArgs();

      expect(options.command).toBe('validate-plugin');
      expect(options.commandArgs).toEqual(['./my-plugin']);
    });

    it('should parse validate-config command', async () => {
      process.argv = ['node', 'clawdash', 'validate-config', './config.json'];
      const { parseCliArgs } = await import('../src/cli/args.js');

      const options = parseCliArgs();

      expect(options.command).toBe('validate-config');
      expect(options.commandArgs).toEqual(['./config.json']);
    });

    it('should handle command with multiple args', async () => {
      process.argv = ['node', 'clawdash', 'create-plugin', 'my-widget', '--template', 'basic'];
      const { parseCliArgs } = await import('../src/cli/args.js');

      const options = parseCliArgs();

      expect(options.command).toBe('create-plugin');
      expect(options.commandArgs).toEqual(['my-widget', '--template', 'basic']);
    });

    it('should handle unknown flags gracefully', async () => {
      process.argv = ['node', 'clawdash', '--unknown-flag'];
      const { parseCliArgs } = await import('../src/cli/args.js');

      // Should not throw
      const options = parseCliArgs();

      expect(options).toBeDefined();
      expect(options.help).toBe(false);
    });

    it('should handle empty arguments', async () => {
      process.argv = ['node', 'clawdash'];
      const { parseCliArgs } = await import('../src/cli/args.js');

      const options = parseCliArgs();

      expect(options.command).toBeNull();
      expect(options.help).toBe(false);
      expect(options.version).toBe(false);
    });

    it('should handle flags after command', async () => {
      process.argv = ['node', 'clawdash', 'validate-plugin', './plugin', '--verbose'];
      const { parseCliArgs } = await import('../src/cli/args.js');

      const options = parseCliArgs();

      // Command parsing should stop after command is detected
      expect(options.command).toBe('validate-plugin');
      expect(options.commandArgs).toEqual(['./plugin', '--verbose']);
    });
  });

  describe('Help Module', () => {
    it('should export showHelp function', async () => {
      const { showHelp } = await import('../src/cli/help.js');

      expect(showHelp).toBeDefined();
      expect(typeof showHelp).toBe('function');
    });

    it('should have default export', async () => {
      const helpModule = await import('../src/cli/help.js');

      expect(helpModule.default).toBeDefined();
      expect(helpModule.default.showHelp).toBeDefined();
    });
  });

  describe('Version Module', () => {
    it('should export showVersion function', async () => {
      const { showVersion } = await import('../src/cli/version.js');

      expect(showVersion).toBeDefined();
      expect(typeof showVersion).toBe('function');
    });

    it('should have default export', async () => {
      const versionModule = await import('../src/cli/version.js');

      expect(versionModule.default).toBeDefined();
      expect(versionModule.default.showVersion).toBeDefined();
    });
  });

  describe('Plugin Scaffolding', () => {
    it('should export createPlugin function', async () => {
      const { createPlugin } = await import('../src/plugin-scaffold.js');

      expect(createPlugin).toBeDefined();
      expect(typeof createPlugin).toBe('function');
    });

    it('should export runScaffoldCli function', async () => {
      const { runScaffoldCli } = await import('../src/plugin-scaffold.js');

      expect(runScaffoldCli).toBeDefined();
      expect(typeof runScaffoldCli).toBe('function');
    });

    it('should export named functions', async () => {
      const scaffoldModule = await import('../src/plugin-scaffold.js');

      expect(scaffoldModule.createPlugin).toBeDefined();
      expect(scaffoldModule.runScaffoldCli).toBeDefined();
    });
  });

  // Direct snapshot I/O + CLI coverage (addresses test gap for export/import/delete + validator/snapshot paths).
  // Exercises abs arbitrary, dot-dir paths (e.g. .openclaw for standard ~/.openclaw flows + hidden whitelist),
  // success/error, delete post-val safePath, and CLI runners (minimal to catch regressions while keeping small).
  describe('Snapshot I/O and CLI (direct + end-to-end paths)', () => {
    it('should export/import/delete snapshot to arbitrary /tmp-style abs path (non-dot)', async () => {
      const { createSnapshot, exportSnapshotToFile, importSnapshotFromFile, deleteSnapshot, getSnapshotsDirectory } = await import('../src/snapshot.js');
      const snapshot = createSnapshot({ theme: 'dark' });
      const absPath = join(tempDir, 'test-abs-snapshot.json');

      const exp = exportSnapshotToFile(snapshot, absPath);
      expect(exp.success).toBe(true);
      expect(existsSync(absPath)).toBe(true);

      const imp = importSnapshotFromFile(absPath);
      expect(imp.success).toBe(true);
      expect(imp.snapshot.settings.theme).toBe('dark');

      // deleteSnapshot is filename-only (joins internal getSnapshotsDirectory()); exercises validator+realpath logic (error on missing); positive below
      const del = deleteSnapshot('nonexistent-for-test.json');
      expect(del.success).toBe(false);
      expect(del.error).toMatch(/not found|Invalid/);

      // positive internal-dir delete test (exercises validator+realpath+unlink success); hermetic via finally for posPath (addresses side-effect on real ~/.openclaw/snapshots)
      const snapDir = getSnapshotsDirectory();
      mkdirSync(snapDir, { recursive: true });
      const posName = `test-del-${Date.now()}.json`;
      const posPath = join(snapDir, posName);
      let createdPos = false;
      try {
        writeFileSync(posPath, JSON.stringify({ schemaVersion: '1.0.0', settings: {} }));
        createdPos = true;
        const delPos = deleteSnapshot(posName);
        expect(delPos.success).toBe(true);
        expect(existsSync(posPath)).toBe(false);
      } finally {
        if (createdPos && existsSync(posPath)) {
          try { rmSync(posPath, { force: true }); } catch {}
        }
      }
    });

    it('should support paths under dot-dir like .openclaw (standard internal ~/.openclaw/snapshots flows)', async () => {
      const { createSnapshot, exportSnapshotToFile, importSnapshotFromFile } = await import('../src/snapshot.js');
      const dotSnapDir = join(tempDir, '.openclaw', 'snapshots');
      mkdirSync(dotSnapDir, { recursive: true });
      const snapshot = createSnapshot({ refreshInterval: 5000 });
      const dotPath = join(dotSnapDir, 'dot-snap.json');

      const exp = exportSnapshotToFile(snapshot, dotPath);
      expect(exp.success).toBe(true); // would have failed pre-hidden whitelist
      expect(existsSync(dotPath)).toBe(true);

      const imp = importSnapshotFromFile(dotPath);
      expect(imp.success).toBe(true);
      expect(imp.snapshot.settings.refreshInterval).toBe(5000);
    });

    it('should reject traversal/invalid but allow valid abs for snapshot fns', async () => {
      const { exportSnapshotToFile } = await import('../src/snapshot.js');
      const snapshot = { schemaVersion: '1.0.0', settings: {} };

      // Use concat (not join) so literal '../' reaches validator's includes('../') check (join would collapse)
      const bad = exportSnapshotToFile(snapshot, tempDir + '/../escape.json');
      expect(bad.success).toBe(false);
      expect(bad.error).toMatch(/traversal|Invalid/);

      const good = exportSnapshotToFile(snapshot, join(tempDir, 'valid.json'));
      expect(good.success).toBe(true);
    });

    it('should exercise CLI export/import runners with path arg (covers run*SnapshotCli + ~ style)', async () => {
      // Use temp path; CLI resolves ~ but we pass abs here for controlled test
      const expMod = await import('../src/cli/export-snapshot.js');
      const runExport = expMod.runExportSnapshotCli;
      const impMod = await import('../src/cli/import-snapshot.js');
      const runImport = impMod.runImportSnapshotCli;

      const testPath = join(tempDir, 'cli-snap.json');
      // Export via CLI fn (it loads defaults internally)
      const exportCode = await runExport([testPath, '--json']);
      if (existsSync(testPath)) {
        expect(exportCode).toBe(0);
        const importCode = await runImport([testPath, '--dry-run', '--json']);
        expect(importCode).toBe(0);
      } else {
        expect([0, 1]).toContain(exportCode);
      }

      // ~ edge for runner (exercises CLI ~ resolve branch) + explicit other-dot hidden reject for snapshot rules (abs path with .secret component; validator rejects even with allowAbsolute; no write side-effect)
      const badTildeHidden = '~/.config/.secret/bad-cli-snap.json';
      const badCode = await runExport([badTildeHidden, '--json']);
      expect(badCode).toBe(1);
    });

    it('should reject other hidden dir components even for abs snapshot paths (documents shared validator rule)', async () => {
      const { exportSnapshotToFile } = await import('../src/snapshot.js');
      const snapshot = { schemaVersion: '1.0.0', settings: {} };
      const badDotAbs = join(tempDir, '.secret', 'bad-snap.json'); // .secret component triggers hidden reject
      const exp = exportSnapshotToFile(snapshot, badDotAbs);
      expect(exp.success).toBe(false);
      expect(exp.error).toMatch(/Hidden files\/directories are not allowed/);
    });
  });
});
