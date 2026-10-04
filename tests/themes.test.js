/**
 * Tests for themes.js settings persistence.
 *
 * Regression: saveTheme() previously wrapped the settings read in a bare
 * `catch {}`. When the existing settings file was corrupt, the parse error
 * was swallowed, `settings` stayed {}, and the file was then overwritten with
 * a theme-only object — silently destroying every other user setting.
 *
 * Correct behaviour: an unreadable settings file is left alone (with a
 * warning) rather than blanked and rewritten.
 *
 * NOTE ON ISOLATION: themes.js computes SETTINGS_PATH once at module load
 * from process.env.HOME, so HOME must be set BEFORE the module is imported.
 * Each test therefore sets HOME, then imports the module with a cache-busting
 * specifier so it re-evaluates against the new HOME.
 */

import fs from 'fs';
import os from 'os';
import path from 'path';

let tmpHome;
let settingsPath;
let originalHome;
let importSeq = 0;

/** Import themes.js fresh, after HOME has been pointed at tmpHome. */
async function loadThemes() {
  importSeq += 1;
  return import(`../src/themes.js?test=${importSeq}`);
}

beforeEach(() => {
  originalHome = process.env.HOME;
  tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), 'themes-test-'));
  process.env.HOME = tmpHome;
  settingsPath = path.join(tmpHome, '.openclaw', 'dashboard-settings.json');
});

afterEach(() => {
  process.env.HOME = originalHome;
  fs.rmSync(tmpHome, { recursive: true, force: true });
});

describe('saveTheme', () => {
  test('leaves an unreadable settings file untouched instead of blanking it', async () => {
    fs.mkdirSync(path.dirname(settingsPath), { recursive: true });
    const corrupt = '{ "refreshInterval": 5,';
    fs.writeFileSync(settingsPath, corrupt);

    const { saveTheme, setTheme } = await loadThemes();
    setTheme('dark');
    saveTheme();

    // Buggy code overwrites the file with { "theme": "dark" }, destroying the
    // unparseable-but-present data. Fixed code leaves it exactly as it was.
    expect(fs.readFileSync(settingsPath, 'utf8')).toBe(corrupt);
  });

  test('still writes normally when no settings file exists yet', async () => {
    expect(fs.existsSync(settingsPath)).toBe(false);

    const { saveTheme, setTheme } = await loadThemes();
    setTheme('dark');
    saveTheme();

    expect(fs.existsSync(settingsPath)).toBe(true);
    expect(JSON.parse(fs.readFileSync(settingsPath, 'utf8')).theme).toBe('dark');
  });
});
