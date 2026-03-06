/**
 * Tests for removed dependencies and widgets
 * Verifies cleanup after blessed-contrib and NetworkWidget removal
 */

import { jest } from '@jest/globals';
import { describe, test, expect } from '@jest/globals';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('Removed dependencies cleanup', () => {
  describe('blessed-contrib removal', () => {
    test('should not have blessed-contrib in package.json dependencies', () => {
      const pkg = JSON.parse(
        readFileSync(join(__dirname, '../package.json'), 'utf8')
      );
      expect(pkg.dependencies).not.toHaveProperty('blessed-contrib');
    });

    test('should not import blessed-contrib in index.js', () => {
      const indexContent = readFileSync(join(__dirname, '../index.js'), 'utf8');
      expect(indexContent).not.toContain("import contrib from 'blessed-contrib'");
      expect(indexContent).not.toContain('blessed-contrib');
    });
  });

  describe('NetworkWidget removal', () => {
    test('should not export NetworkWidget from widgets/index.js', async () => {
      const widgets = await import('../src/widgets/index.js');
      expect(widgets.NetworkWidget).toBeUndefined();
    });

    test('should not have NetworkWidget in builtin-widgets exports', async () => {
      const builtin = await import('../src/widgets/builtin-widgets.js');
      expect(builtin.NetworkWidget).toBeUndefined();
      expect(builtin.WIDGET_REGISTRY).not.toHaveProperty('network');
    });

    test('builtin-widgets should not reference blessed-contrib', () => {
      const content = readFileSync(
        join(__dirname, '../src/widgets/builtin-widgets.js'),
        'utf8'
      );
      expect(content).not.toContain('blessed-contrib');
      expect(content).not.toContain('contrib.sparkline');
    });
  });

  describe('@pm2/blessed migration', () => {
    test('should have @pm2/blessed as dependency', () => {
      const pkg = JSON.parse(
        readFileSync(join(__dirname, '../package.json'), 'utf8')
      );
      expect(pkg.dependencies).toHaveProperty('@pm2/blessed');
    });

    test('should have blessed aliased to @pm2/blessed', () => {
      const pkg = JSON.parse(
        readFileSync(join(__dirname, '../package.json'), 'utf8')
      );
      expect(pkg.dependencies.blessed).toBe('npm:@pm2/blessed@^0.1.81');
    });

    test('should be able to import blessed', async () => {
      // This verifies the alias is working
      const blessed = await import('blessed');
      expect(typeof blessed.default).toBe('function');
    });
  });
});
