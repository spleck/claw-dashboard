# Contributing to Claw Dashboard

Thank you for your interest in contributing to Claw Dashboard! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Release Process](#release-process)

## Code of Conduct

This project adheres to a code of conduct that we expect all contributors to follow:

- Be respectful and inclusive in all interactions
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Accept constructive criticism gracefully

## Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher
- **OpenClaw** installed and configured (for full integration testing)

### Setup

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/claw-dashboard.git
   cd claw-dashboard
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Run the dashboard:
   ```bash
   npm start
   ```

## Development Workflow

### Branch Naming

Use descriptive branch names with the following prefixes:

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Test additions or updates

Examples:
```
feature/add-custom-widgets
fix/memory-leak-on-refresh
docs/update-api-examples
```

### Making Changes

1. Create a new branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes following the [coding standards](#coding-standards)

3. Test your changes:
   ```bash
   npm test
   ```

4. Update documentation if needed (README.md, API.md, CHANGELOG.md)

## Coding Standards

### JavaScript Style

- Use ES modules (`import`/`export`)
- Use 2 spaces for indentation
- Use semicolons
- Prefer `const` and `let` over `var`
- Use camelCase for variables and functions
- Use PascalCase for classes
- Use UPPER_SNAKE_CASE for constants

Example:
```javascript
// Good
const MAX_RETRIES = 3;

export async function fetchData() {
  const result = await getData();
  return result;
}

export class DataFetcher {
  constructor() {
    this.cache = new Map();
  }
}

// Bad
var MAX_RETRIES = 3;

function fetch_data() {
  let result = getData();
  return result;
}
```

### Code Organization

- Place all source files in `src/`
- Group related functionality into modules
- Keep functions focused and small
- Export only what's necessary from modules

### Configuration

All magic numbers and configurable values should be centralized in `src/config.js`:

```javascript
// In src/config.js
export const CACHE_TTL = {
  CPU: 1000,
  MEMORY: 1000,
  GPU: 5000,
};

// In your module
import { CACHE_TTL } from './config.js';
```

### Error Handling

Use the custom error classes from `src/errors.js`:

```javascript
import { GatewayError, DataFetchError } from './errors.js';
import logger from './logger.js';

try {
  const data = await fetchData();
} catch (error) {
  logger.error('Failed to fetch:', error.message);
  throw new GatewayError('Fetch failed', { cause: error });
}
```

### Logging

Use the logger module instead of `console.log`:

```javascript
import logger from './logger.js';

logger.debug('Debug info');    // Only shows with DEBUG=1
logger.info('General info');
logger.warn('Warning message');
logger.error('Error message');
```

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm test -- --watch
```

### Writing Tests

Place test files in the `tests/` directory with the naming pattern `*.test.js`:

```javascript
// tests/my-feature.test.js
import { describe, test, expect } from '@jest/globals';
import { myFunction } from '../src/my-module.js';

describe('myFunction', () => {
  test('should return expected result', () => {
    const result = myFunction('input');
    expect(result).toBe('expected output');
  });

  test('should handle errors gracefully', async () => {
    await expect(myFunction(null)).rejects.toThrow();
  });
});
```

### Test Guidelines

- Write tests for new functionality
- Ensure all existing tests pass before submitting
- Aim for meaningful coverage, not just high percentages
- Test edge cases and error conditions
- Use descriptive test names that explain the behavior

## Submitting Changes

### Pull Request Process

1. Ensure your branch is up to date with `main`:
   ```bash
   git fetch origin
   git rebase origin/main
   ```

2. Run the full test suite:
   ```bash
   npm test
   ```

3. Update the CHANGELOG.md if applicable

4. Push your branch:
   ```bash
   git push origin feature/your-feature-name
   ```

5. Create a Pull Request on GitHub with:
   - Clear title describing the change
   - Detailed description explaining what and why
   - Reference any related issues (e.g., "Fixes #123")
   - Screenshots/gifs for UI changes

### PR Review Process

- All PRs require at least one review
- Address review feedback promptly
- Be open to suggestions and changes
- Squash commits if requested

## Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Format

```
<type>: <description>

[optional body]

[optional footer(s)]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation changes |
| `style` | Code style changes (formatting, semicolons, etc.) |
| `refactor` | Code refactoring |
| `test` | Test additions or updates |
| `chore` | Build process or auxiliary tool changes |

### Examples

```
feat: add session sorting by token usage

fix: resolve memory leak in widget refresh cycle
docs: update API documentation for gateway manager
refactor: extract cache logic into separate module
test: add unit tests for error classes
chore: update dependencies to latest versions
```

### Rules

- Use present tense ("add feature" not "added feature")
- Use imperative mood ("move cursor" not "moves cursor")
- Don't capitalize the first letter
- No period at the end
- Keep the first line under 72 characters

## Release Process

We use an automated release script that handles versioning, building, signing, and tagging.

### Prerequisites

- Node.js v18+ with npm
- GPG key configured (for signed releases)
- GitHub CLI (`gh`) installed (for GitHub releases)

### Quick Release

```bash
# Patch release (1.0.0 → 1.0.1)
npm run release

# Minor release (1.0.0 → 1.1.0)
npm run release minor

# Major release (1.0.0 → 2.0.0)
npm run release major

# With GPG signing
npm run release:sign

# With GitHub release creation
npm run release:github
```

### Manual Release Steps

If you prefer to release manually:

1. Update version in `package.json`
2. Update CHANGELOG.md with release date
3. Build the project: `npm run build`
4. Create a git tag: `git tag vX.Y.Z`
5. Push tags: `git push origin vX.Y.Z`
6. Create a GitHub release with release notes

### Release Script Features

The automated release script (`scripts/release.js`):

- **Validates** the working directory is clean
- **Bumps** version in package.json (patch/minor/major)
- **Updates** CHANGELOG.md with new release date
- **Builds** the project with ESBuild (creates `dist/clawdash`)
- **Signs** releases with GPG (optional, use `--sign`)
- **Creates** git commit and annotated tag
- **Publishes** GitHub release (optional, use `--github`)

### Build System

We use **ESBuild** for bundling:

```bash
# Production build (minified)
npm run build

# Development build (with source maps)
npm run build:dev

# Analyze bundle size
npm run build -- --analyze
```

The build creates:
- `dist/clawdash` - Bundled, minified executable
- `dist/clawdash.meta.json` - Bundle analysis metadata

## Questions?

If you have questions or need help:

- Open an issue on GitHub
- Check existing issues and discussions
- Review the [API documentation](docs/API.md)

Thank you for contributing!
