#!/usr/bin/env node

/**
 * Automated Release Script for claw-dashboard
 *
 * This script automates the release process:
 * 1. Validates the working directory is clean
 * 2. Bumps version in package.json (patch/minor/major)
 * 3. Updates CHANGELOG.md with new version entry
 * 4. Builds the project with ESBuild
 * 5. Creates GPG-signed git tag
 * 6. Optionally creates GitHub release
 *
 * Usage:
 *   node scripts/release.js [patch|minor|major] [--sign] [--github]
 *
 * Options:
 *   patch, minor, major  - Version bump type (default: patch)
 *   --sign, -s          - GPG sign the release tag and artifacts
 *   --github, -g        - Create GitHub release (requires gh CLI)
 *   --dry-run, -d       - Preview changes without executing
 *   --help, -h          - Show help
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');

// Colors for output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

/**
 * Print styled message
 */
function log(message, type = 'info') {
  const prefix = {
    info: `${colors.cyan}ℹ${colors.reset}`,
    success: `${colors.green}✓${colors.reset}`,
    warning: `${colors.yellow}⚠${colors.reset}`,
    error: `${colors.red}✗${colors.reset}`,
    step: `${colors.bright}→${colors.reset}`,
  }[type] || 'ℹ';

  console.log(`${prefix} ${message}`);
}

/**
 * Execute command with error handling
 */
function exec(command, options = {}) {
  try {
    return execSync(command, {
      encoding: 'utf8',
      cwd: ROOT,
      stdio: options.silent ? 'pipe' : 'inherit',
      ...options,
    });
  } catch (error) {
    if (!options.ignoreErrors) {
      throw new Error(`Command failed: ${command}\n${error.message}`);
    }
    return null;
  }
}

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const result = {
    bumpType: 'patch',
    sign: false,
    github: false,
    dryRun: false,
    help: false,
  };

  for (const arg of args) {
    switch (arg) {
      case 'patch':
      case 'minor':
      case 'major':
        result.bumpType = arg;
        break;
      case '--sign':
      case '-s':
        result.sign = true;
        break;
      case '--github':
      case '-g':
        result.github = true;
        break;
      case '--dry-run':
      case '-d':
        result.dryRun = true;
        break;
      case '--help':
      case '-h':
        result.help = true;
        break;
    }
  }

  return result;
}

/**
 * Show help message
 */
function showHelp() {
  console.log(`
${colors.bright}Release Script for claw-dashboard${colors.reset}

Automates the release process with version bumping, building, and signing.

${colors.bright}Usage:${colors.reset}
  node scripts/release.js [patch|minor|major] [options]

${colors.bright}Version Types:${colors.reset}
  patch    Increment patch version (1.0.0 → 1.0.1) [default]
  minor    Increment minor version (1.0.0 → 1.1.0)
  major    Increment major version (1.0.0 → 2.0.0)

${colors.bright}Options:${colors.reset}
  --sign, -s      GPG sign the release tag and artifacts
  --github, -g    Create GitHub release (requires gh CLI)
  --dry-run, -d   Preview changes without executing
  --help, -h      Show this help message

${colors.bright}Examples:${colors.reset}
  node scripts/release.js patch           # Patch release
  node scripts/release.js minor --sign    # Minor release with GPG signing
  node scripts/release.js major --github  # Major release with GitHub release
  node scripts/release.js --dry-run       # Preview changes

${colors.bright}Requirements for signing:${colors.reset}
  - GPG key configured: git config --global user.signingkey YOUR_KEY_ID
  - GPG key added to GitHub: https://github.com/settings/gpg/new
`);
}

/**
 * Check if working directory is clean
 */
function checkWorkingDirectory() {
  log('Checking working directory status...', 'step');

  try {
    const status = exec('git status --porcelain', { silent: true });
    if (status && status.trim()) {
      throw new Error('Working directory is not clean. Please commit or stash changes first.');
    }
    log('Working directory is clean', 'success');
  } catch (error) {
    if (error.message.includes('not a git repository')) {
      throw new Error('Not a git repository');
    }
    throw error;
  }
}

/**
 * Get current version from package.json
 */
function getCurrentVersion() {
  const pkgPath = join(ROOT, 'package.json');
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
  return pkg.version;
}

/**
 * Bump version based on type
 */
function bumpVersion(currentVersion, bumpType) {
  const parts = currentVersion.split('.').map(Number);
  const [major, minor, patch] = parts;

  switch (bumpType) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
    default:
      return `${major}.${minor}.${patch + 1}`;
  }
}

/**
 * Update version in package.json
 */
function updatePackageVersion(newVersion, dryRun) {
  log(`Updating package.json to v${newVersion}...`, 'step');

  const pkgPath = join(ROOT, 'package.json');
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
  const oldVersion = pkg.version;
  pkg.version = newVersion;

  if (dryRun) {
    log(`[DRY-RUN] Would update version: ${oldVersion} → ${newVersion}`, 'warning');
    return;
  }

  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
  log(`Version updated: ${oldVersion} → ${newVersion}`, 'success');
}

/**
 * Get latest changelog entry
 */
function getLatestChangelogEntry() {
  const changelogPath = join(ROOT, 'CHANGELOG.md');
  if (!existsSync(changelogPath)) {
    return null;
  }

  const content = readFileSync(changelogPath, 'utf8');
  const unreleasedMatch = content.match(/## \[Unreleased\]([\s\S]*?)(?=## \[|$)/);

  if (unreleasedMatch) {
    return unreleasedMatch[1].trim();
  }

  return null;
}

/**
 * Update CHANGELOG.md
 */
function updateChangelog(newVersion, dryRun) {
  log('Updating CHANGELOG.md...', 'step');

  const changelogPath = join(ROOT, 'CHANGELOG.md');
  if (!existsSync(changelogPath)) {
    log('CHANGELOG.md not found, skipping', 'warning');
    return null;
  }

  const today = new Date().toISOString().split('T')[0];
  const unreleasedSection = getLatestChangelogEntry();

  let content = readFileSync(changelogPath, 'utf8');

  // Replace [Unreleased] link with new version
  const unreleasedLink = `[Unreleased]: https://github.com/spleck/claw-dashboard/compare/v${newVersion}...HEAD`;
  const newVersionLink = `[${newVersion}]: https://github.com/spleck/claw-dashboard/compare/v${getCurrentVersion()}...v${newVersion}`;

  content = content.replace(
    /## \[Unreleased\]/,
    `## [Unreleased]\n\n## [${newVersion}] - ${today}`
  );

  // Update comparison links at the bottom
  content = content.replace(
    /\[Unreleased\]: .*/,
    `${unreleasedLink}\n${newVersionLink}`
  );

  if (dryRun) {
    log('[DRY-RUN] Would update CHANGELOG.md', 'warning');
    return unreleasedSection;
  }

  writeFileSync(changelogPath, content);
  log('CHANGELOG.md updated', 'success');

  return unreleasedSection;
}

/**
 * Check if ESBuild is available
 */
function checkEsbuild() {
  log('Checking ESBuild availability...', 'step');

  try {
    exec('npx esbuild --version', { silent: true });
    log('ESBuild is available', 'success');
    return true;
  } catch {
    log('ESBuild not found, installing...', 'warning');
    try {
      exec('npm install --save-dev esbuild');
      log('ESBuild installed', 'success');
      return true;
    } catch (error) {
      log('Failed to install ESBuild', 'error');
      return false;
    }
  }
}

/**
 * Build the project
 */
function buildProject(dryRun) {
  log('Building project...', 'step');

  if (dryRun) {
    log('[DRY-RUN] Would run: node esbuild.config.js', 'warning');
    return;
  }

  // Ensure dist directory exists
  const distPath = join(ROOT, 'dist');
  if (!existsSync(distPath)) {
    mkdirSync(distPath, { recursive: true });
  }

  try {
    exec('node esbuild.config.js');
    log('Build successful', 'success');
  } catch (error) {
    throw new Error(`Build failed: ${error.message}`);
  }
}

/**
 * Check if GPG is configured
 */
function checkGpgConfig() {
  try {
    const signingKey = exec('git config --get user.signingkey', {
      silent: true,
      ignoreErrors: true,
    });
    return signingKey && signingKey.trim();
  } catch {
    return null;
  }
}

/**
 * Check GPG availability
 */
function checkGpg(sign) {
  if (!sign) return true;

  log('Checking GPG configuration...', 'step');

  const signingKey = checkGpgConfig();
  if (!signingKey) {
    throw new Error(
      'GPG signing requested but no signing key configured.\n' +
      'Run: git config --global user.signingkey YOUR_KEY_ID'
    );
  }

  try {
    exec(`gpg --list-keys ${signingKey.trim()}`, { silent: true });
    log(`GPG key found: ${signingKey.trim().substring(0, 16)}...`, 'success');
    return true;
  } catch {
    throw new Error(`GPG key ${signingKey.trim()} not found in keyring`);
  }
}

/**
 * Create GPG signature for artifact
 */
function createGpgSignature(filePath, dryRun) {
  if (dryRun) {
    log(`[DRY-RUN] Would sign: ${filePath}`, 'warning');
    return;
  }

  try {
    exec(`gpg --armor --detach-sign --output ${filePath}.asc ${filePath}`, {
      silent: true,
    });
    log(`GPG signature created: ${filePath}.asc`, 'success');
  } catch (error) {
    log(`Failed to sign ${filePath}: ${error.message}`, 'warning');
  }
}

/**
 * Sign release artifacts
 */
function signArtifacts(version, dryRun) {
  log('Signing release artifacts...', 'step');

  const artifacts = [
    join(ROOT, 'dist', 'clawdash'),
    join(ROOT, 'package.json'),
  ];

  for (const artifact of artifacts) {
    if (existsSync(artifact)) {
      createGpgSignature(artifact, dryRun);
    }
  }
}

/**
 * Create git commit and tag
 */
function createGitTag(version, sign, releaseNotes, dryRun) {
  log('Creating git commit and tag...', 'step');

  const tagMessage = releaseNotes
    ? `Release v${version}\n\n${releaseNotes}`
    : `Release v${version}`;

  if (dryRun) {
    log('[DRY-RUN] Would create commit: chore: bump version to v' + version, 'warning');
    log(`[DRY-RUN] Would create tag: v${version}${sign ? ' (GPG signed)' : ''}`, 'warning');
    return;
  }

  // Stage changes
  exec('git add package.json CHANGELOG.md');

  // Create commit
  exec(`git commit -m "chore: bump version to v${version}"`);
  log(`Created commit: chore: bump version to v${version}`, 'success');

  // Create tag
  const tagCmd = sign
    ? `git tag -s v${version} -m "${tagMessage}"`
    : `git tag -a v${version} -m "${tagMessage}"`;

  exec(tagCmd);
  log(`Created tag: v${version}${sign ? ' (GPG signed)' : ''}`, 'success');
}

/**
 * Check if GitHub CLI is available
 */
function checkGhCli() {
  try {
    exec('gh --version', { silent: true });
    return true;
  } catch {
    return false;
  }
}

/**
 * Create GitHub release
 */
function createGithubRelease(version, releaseNotes, sign, dryRun) {
  log('Creating GitHub release...', 'step');

  if (!checkGhCli()) {
    log('GitHub CLI (gh) not found, skipping GitHub release', 'warning');
    log('Install from: https://cli.github.com/', 'info');
    return;
  }

  const title = `v${version}`;
  const notes = releaseNotes || `Release ${title}`;

  const cmd = [
    'gh release create',
    `v${version}`,
    '--title', `"${title}"`,
    '--notes', `"${notes}"`,
    sign ? '--verify-tag' : '',
    join(ROOT, 'dist', 'clawdash'),
  ].filter(Boolean).join(' ');

  if (dryRun) {
    log('[DRY-RUN] Would run: ' + cmd, 'warning');
    return;
  }

  try {
    exec(cmd);
    log(`GitHub release created: ${title}`, 'success');
  } catch (error) {
    log(`Failed to create GitHub release: ${error.message}`, 'warning');
  }
}

/**
 * Print summary
 */
function printSummary(version, bumpType, sign, github, dryRun) {
  console.log(`
${colors.bright}╔══════════════════════════════════════════╗${colors.reset}
${colors.bright}║${colors.reset}        ${colors.green}Release Summary${colors.reset}                ${colors.bright}║${colors.reset}
${colors.bright}╠══════════════════════════════════════════╣${colors.reset}
  Version:     ${colors.cyan}v${version}${colors.reset}
  Type:        ${colors.yellow}${bumpType}${colors.reset}
  GPG Sign:    ${sign ? colors.green + 'Yes' : colors.gray + 'No'}${colors.reset}
  GitHub:      ${github ? colors.green + 'Yes' : colors.gray + 'No'}${colors.reset}
  Mode:        ${dryRun ? colors.yellow + 'DRY-RUN' : colors.green + 'LIVE'}${colors.reset}
${colors.bright}╚══════════════════════════════════════════╝${colors.reset}
`);

  if (!dryRun) {
    console.log(`
Next steps:
  1. Review the changes: git show HEAD
  2. Review the tag: git show v${version}
  3. Push to remote: git push && git push origin v${version}
`);
  }
}

/**
 * Main execution
 */
async function main() {
  const args = parseArgs();

  if (args.help) {
    showHelp();
    process.exit(0);
  }

  console.log(`\n${colors.bright}🚀 Starting Release Process${colors.reset}\n`);

  try {
    // Pre-flight checks
    checkWorkingDirectory();

    const currentVersion = getCurrentVersion();
    log(`Current version: ${currentVersion}`, 'info');

    const newVersion = bumpVersion(currentVersion, args.bumpType);
    log(`New version will be: ${newVersion}`, 'info');

    // Check dependencies
    if (!checkEsbuild()) {
      process.exit(1);
    }

    if (args.sign && !checkGpg(args.sign)) {
      process.exit(1);
    }

    if (args.github && !checkGhCli()) {
      log('GitHub CLI not found, but continuing...', 'warning');
    }

    // Confirmation prompt in non-dry-run mode
    if (!args.dryRun) {
      console.log(`\n${colors.yellow}This will create a new release.${colors.reset}`);
      console.log(`${colors.gray}Use --dry-run to preview changes.${colors.reset}\n`);
    }

    // Execute release steps
    updatePackageVersion(newVersion, args.dryRun);
    const releaseNotes = updateChangelog(newVersion, args.dryRun);
    buildProject(args.dryRun);

    if (args.sign) {
      signArtifacts(newVersion, args.dryRun);
    }

    createGitTag(newVersion, args.sign, releaseNotes, args.dryRun);

    if (args.github) {
      createGithubRelease(newVersion, releaseNotes, args.sign, args.dryRun);
    }

    // Summary
    printSummary(newVersion, args.bumpType, args.sign, args.github, args.dryRun);

    process.exit(0);
  } catch (error) {
    console.error(`\n${colors.red}✗ Release failed:${colors.reset}`, error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export {
  bumpVersion,
  checkWorkingDirectory,
  getCurrentVersion,
  updatePackageVersion,
  updateChangelog,
};
