/**
 * Tests for theme-selector.js
 */

import {
  getThemeInfo,
  getAllThemesInfo
} from '../src/theme-selector.js';

describe('Theme Selector', () => {
  describe('getThemeInfo', () => {
    test('should return theme info for a theme', () => {
      const info = getThemeInfo('dark');

      expect(info).toBeDefined();
      expect(info.name).toBe('dark');
      expect(typeof info.displayName).toBe('string');
      expect(typeof info.isCurrent).toBe('boolean');
      expect(info.isAuto).toBe(false);
    });

    test('should identify auto theme', () => {
      const info = getThemeInfo('auto');

      expect(info.isAuto).toBe(true);
      expect(info.displayName).toBe('Auto-detect');
    });

    test('should include color categories for regular themes', () => {
      const info = getThemeInfo('dark');

      expect(Array.isArray(info.colors)).toBe(true);
    });
  });

  describe('getAllThemesInfo', () => {
    test('should return info for all themes', () => {
      const themes = getAllThemesInfo();

      expect(Array.isArray(themes)).toBe(true);
      expect(themes.length).toBeGreaterThan(0);

      // Check for expected theme names
      const names = themes.map(t => t.name);
      expect(names).toContain('default');
      expect(names).toContain('dark');
      expect(names).toContain('auto');
    });

    test('should mark one theme as current', () => {
      const themes = getAllThemesInfo();
      const currentThemes = themes.filter(t => t.isCurrent);

      expect(currentThemes.length).toBe(1);
    });
  });
});
