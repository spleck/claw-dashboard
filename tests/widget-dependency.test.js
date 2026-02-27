/**
 * Widget Dependency Resolver Tests
 * Tests for dependency resolution, topological sorting, and constraint checking
 */

import { jest } from '@jest/globals';
import {
  parseDependency,
  parseDependencies,
  buildDependencyGraph,
  detectCircularDependency,
  satisfiesVersion,
  checkVersionConstraints,
  findMissingDependencies,
  topologicalSort,
  resolveDependencies,
  getAllDependencies,
  getAllDependents,
  validateWidgetDependencies,
} from '../src/widgets/dependency-resolver.js';

describe('parseDependency', () => {
  test('should parse simple string dependency', () => {
    const dep = parseDependency('my-widget');
    expect(dep).toEqual({ id: 'my-widget', optional: false });
  });

  test('should parse object dependency with optional flag', () => {
    const dep = parseDependency({ id: 'my-widget', optional: true });
    expect(dep).toEqual({ id: 'my-widget', optional: true });
  });

  test('should parse object dependency with version constraint', () => {
    const dep = parseDependency({ id: 'my-widget', version: '>=1.0.0' });
    expect(dep).toEqual({ id: 'my-widget', optional: false, version: '>=1.0.0' });
  });

  test('should parse full dependency object', () => {
    const dep = parseDependency({ id: 'my-widget', optional: true, version: '^2.0.0' });
    expect(dep).toEqual({ id: 'my-widget', optional: true, version: '^2.0.0' });
  });

  test('should throw for invalid dependency types', () => {
    expect(() => parseDependency(123)).toThrow(/must be a string or an object/);
    expect(() => parseDependency(null)).toThrow(/must be a string or an object/);
    expect(() => parseDependency(undefined)).toThrow(/must be a string or an object/);
  });

  test('should throw for object without id', () => {
    expect(() => parseDependency({ optional: true })).toThrow(/must have a string "id" property/);
    expect(() => parseDependency({ id: 123 })).toThrow(/must have a string "id" property/);
  });
});

describe('parseDependencies', () => {
  test('should return empty array for undefined dependencies', () => {
    expect(parseDependencies({})).toEqual([]);
    expect(parseDependencies({ dependencies: null })).toEqual([]);
  });

  test('should parse mixed dependency formats', () => {
    const metadata = {
      id: 'test-widget',
      dependencies: [
        'simple-dep',
        { id: 'optional-dep', optional: true },
        { id: 'versioned-dep', version: '>=1.0.0' },
      ],
    };

    const deps = parseDependencies(metadata);
    expect(deps).toHaveLength(3);
    expect(deps[0]).toEqual({ id: 'simple-dep', optional: false });
    expect(deps[1]).toEqual({ id: 'optional-dep', optional: true });
    expect(deps[2]).toEqual({ id: 'versioned-dep', optional: false, version: '>=1.0.0' });
  });

  test('should skip invalid dependencies and log warning', () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    const metadata = {
      id: 'test-widget',
      dependencies: ['valid-dep', 123, null, 'another-valid'],
    };

    const deps = parseDependencies(metadata);
    expect(deps).toHaveLength(2);
    expect(deps[0].id).toBe('valid-dep');
    expect(deps[1].id).toBe('another-valid');

    consoleSpy.mockRestore();
  });
});

describe('buildDependencyGraph', () => {
  test('should build graph for widgets with no dependencies', () => {
    const registry = new Map([
      ['widget-a', { metadata: { id: 'widget-a', dependencies: [] } }],
      ['widget-b', { metadata: { id: 'widget-b' } }],
    ]);

    const graph = buildDependencyGraph(registry);

    expect(graph.size).toBe(2);
    expect(graph.get('widget-a').dependencies).toEqual([]);
    expect(graph.get('widget-b').dependencies).toEqual([]);
  });

  test('should build graph with dependencies', () => {
    const registry = new Map([
      ['base', { metadata: { id: 'base', dependencies: [] } }],
      ['child', { metadata: { id: 'child', dependencies: ['base'] } }],
      ['grandchild', { metadata: { id: 'grandchild', dependencies: ['child'] } }],
    ]);

    const graph = buildDependencyGraph(registry);

    expect(graph.get('child').inDegree).toBe(1);
    expect(graph.get('grandchild').inDegree).toBe(1);
    expect(graph.get('base').dependents).toContain('child');
    expect(graph.get('child').dependents).toContain('grandchild');
  });

  test('should handle widgets with multiple dependencies', () => {
    const registry = new Map([
      ['a', { metadata: { id: 'a' } }],
      ['b', { metadata: { id: 'b' } }],
      ['c', { metadata: { id: 'c', dependencies: ['a', 'b'] } }],
    ]);

    const graph = buildDependencyGraph(registry);

    expect(graph.get('c').inDegree).toBe(2);
    expect(graph.get('c').dependencies).toHaveLength(2);
  });

  test('should handle missing dependencies (not in registry)', () => {
    const registry = new Map([
      ['widget-a', { metadata: { id: 'widget-a', dependencies: ['missing'] } }],
    ]);

    const graph = buildDependencyGraph(registry);

    // Dependency listed but not in registry - inDegree stays 0 for missing dep
    expect(graph.get('widget-a').inDegree).toBe(0);
    expect(graph.get('widget-a').dependencies[0].id).toBe('missing');
  });
});

describe('detectCircularDependency', () => {
  test('should return null for acyclic graph', () => {
    const registry = new Map([
      ['a', { metadata: { id: 'a' } }],
      ['b', { metadata: { id: 'b', dependencies: ['a'] } }],
      ['c', { metadata: { id: 'c', dependencies: ['b'] } }],
    ]);

    const graph = buildDependencyGraph(registry);
    const cycle = detectCircularDependency(graph);

    expect(cycle).toBeNull();
  });

  test('should detect simple circular dependency', () => {
    const registry = new Map([
      ['a', { metadata: { id: 'a', dependencies: ['b'] } }],
      ['b', { metadata: { id: 'b', dependencies: ['a'] } }],
    ]);

    const graph = buildDependencyGraph(registry);
    const cycle = detectCircularDependency(graph);

    expect(cycle).not.toBeNull();
    expect(cycle).toContain('a');
    expect(cycle).toContain('b');
  });

  test('should detect complex circular dependency', () => {
    const registry = new Map([
      ['a', { metadata: { id: 'a', dependencies: ['b'] } }],
      ['b', { metadata: { id: 'b', dependencies: ['c'] } }],
      ['c', { metadata: { id: 'c', dependencies: ['a'] } }],
    ]);

    const graph = buildDependencyGraph(registry);
    const cycle = detectCircularDependency(graph);

    expect(cycle).not.toBeNull();
    expect(cycle).toContain('a');
    expect(cycle).toContain('b');
    expect(cycle).toContain('c');
  });

  test('should return null for empty graph', () => {
    const graph = new Map();
    const cycle = detectCircularDependency(graph);
    expect(cycle).toBeNull();
  });
});

describe('satisfiesVersion', () => {
  test('should return true for exact match', () => {
    expect(satisfiesVersion('1.0.0', '1.0.0')).toBe(true);
    expect(satisfiesVersion('2.5.3', '2.5.3')).toBe(true);
  });

  test('should return false for non-matching exact versions', () => {
    expect(satisfiesVersion('1.0.0', '2.0.0')).toBe(false);
    expect(satisfiesVersion('1.0.0', '1.1.0')).toBe(false);
  });

  test('should handle >= constraint', () => {
    expect(satisfiesVersion('1.0.0', '>=1.0.0')).toBe(true);
    expect(satisfiesVersion('2.0.0', '>=1.0.0')).toBe(true);
    expect(satisfiesVersion('0.9.0', '>=1.0.0')).toBe(false);
  });

  test('should handle ^ constraint (compatible major)', () => {
    expect(satisfiesVersion('1.0.0', '^1.0.0')).toBe(true);
    expect(satisfiesVersion('1.5.0', '^1.0.0')).toBe(true);
    expect(satisfiesVersion('2.0.0', '^1.0.0')).toBe(false);
  });

  test('should handle ~ constraint (approximately equivalent)', () => {
    expect(satisfiesVersion('1.0.0', '~1.0.0')).toBe(true);
    expect(satisfiesVersion('1.0.5', '~1.0.0')).toBe(true);
    expect(satisfiesVersion('1.1.0', '~1.0.0')).toBe(false);
  });

  test('should return true when no version or constraint provided', () => {
    expect(satisfiesVersion('1.0.0', null)).toBe(true);
    expect(satisfiesVersion(null, '1.0.0')).toBe(true);
  });

  test('should handle v prefix in version', () => {
    expect(satisfiesVersion('v1.0.0', '1.0.0')).toBe(true);
    expect(satisfiesVersion('1.0.0', 'v1.0.0')).toBe(true);
  });
});

describe('checkVersionConstraints', () => {
  test('should return null when all constraints satisfied', () => {
    const registry = new Map([
      ['dep', { metadata: { version: '2.0.0' } }],
      ['widget', { metadata: { dependencies: [{ id: 'dep', version: '^2.0.0' }] } }],
    ]);

    const graph = buildDependencyGraph(registry);
    const violations = checkVersionConstraints(graph, registry);

    expect(violations).toBeNull();
  });

  test('should detect version constraint violations', () => {
    const registry = new Map([
      ['dep', { metadata: { version: '1.0.0' } }],
      ['widget', { metadata: { dependencies: [{ id: 'dep', version: '>=2.0.0' }] } }],
    ]);

    const graph = buildDependencyGraph(registry);
    const violations = checkVersionConstraints(graph, registry);

    expect(violations).not.toBeNull();
    expect(violations.widget).toHaveLength(1);
    expect(violations.widget[0].dependency).toBe('dep');
  });

  test('should handle dependency with no version', () => {
    const registry = new Map([
      ['dep', { metadata: {} }],
      ['widget', { metadata: { dependencies: [{ id: 'dep', version: '>=1.0.0' }] } }],
    ]);

    const graph = buildDependencyGraph(registry);
    const violations = checkVersionConstraints(graph, registry);

    expect(violations).not.toBeNull();
    expect(violations.widget[0].reason).toContain('no version');
  });
});

describe('findMissingDependencies', () => {
  test('should return null when all dependencies present', () => {
    const registry = new Map([
      ['dep', { metadata: {} }],
      ['widget', { metadata: { dependencies: ['dep'] } }],
    ]);

    const graph = buildDependencyGraph(registry);
    const missing = findMissingDependencies(graph, registry);

    expect(missing).toBeNull();
  });

  test('should find missing required dependencies', () => {
    const registry = new Map([
      ['widget', { metadata: { dependencies: ['missing-dep'] } }],
    ]);

    const graph = buildDependencyGraph(registry);
    const missing = findMissingDependencies(graph, registry);

    expect(missing).toEqual({ widget: ['missing-dep'] });
  });

  test('should ignore optional dependencies that are missing', () => {
    const registry = new Map([
      ['widget', { metadata: { dependencies: [{ id: 'optional', optional: true }] } }],
    ]);

    const graph = buildDependencyGraph(registry);
    const missing = findMissingDependencies(graph, registry);

    expect(missing).toBeNull();
  });
});

describe('topologicalSort', () => {
  test('should sort widgets in dependency order', () => {
    const registry = new Map([
      ['c', { metadata: { id: 'c', dependencies: ['b'] } }],
      ['a', { metadata: { id: 'a' } }],
      ['b', { metadata: { id: 'b', dependencies: ['a'] } }],
    ]);

    const graph = buildDependencyGraph(registry);
    const order = topologicalSort(graph);

    expect(order).toEqual(['a', 'b', 'c']);
  });

  test('should handle independent widgets', () => {
    const registry = new Map([
      ['b', { metadata: { id: 'b' } }],
      ['a', { metadata: { id: 'a' } }],
      ['c', { metadata: { id: 'c' } }],
    ]);

    const graph = buildDependencyGraph(registry);
    const order = topologicalSort(graph);

    expect(order).toEqual(['a', 'b', 'c']);  // Alphabetically sorted
  });

  test('should sort only specified target widgets', () => {
    const registry = new Map([
      ['base', { metadata: { id: 'base' } }],
      ['other', { metadata: { id: 'other' } }],
      ['child', { metadata: { id: 'child', dependencies: ['base'] } }],
    ]);

    const graph = buildDependencyGraph(registry);
    const order = topologicalSort(graph, ['child']);

    expect(order).toEqual(['base', 'child']);
    expect(order).not.toContain('other');
  });

  test('should return empty array for empty graph', () => {
    const graph = new Map();
    const order = topologicalSort(graph);
    expect(order).toEqual([]);
  });
});

describe('resolveDependencies', () => {
  test('should resolve dependencies successfully', () => {
    const registry = new Map([
      ['a', { metadata: {} }],
      ['b', { metadata: { dependencies: ['a'] } }],
    ]);

    const result = resolveDependencies(registry);

    expect(result.success).toBe(true);
    expect(result.order).toEqual(['a', 'b']);
  });

  test('should detect circular dependencies', () => {
    const registry = new Map([
      ['a', { metadata: { dependencies: ['b'] } }],
      ['b', { metadata: { dependencies: ['a'] } }],
    ]);

    const result = resolveDependencies(registry);

    expect(result.success).toBe(false);
    expect(result.error).toContain('Circular dependency');
    expect(result.circularPath).toBeDefined();
  });

  test('should detect missing dependencies', () => {
    const registry = new Map([
      ['widget', { metadata: { dependencies: ['missing'] } }],
    ]);

    const result = resolveDependencies(registry);

    expect(result.success).toBe(false);
    expect(result.error).toContain('Missing');
    expect(result.missingDeps).toEqual({ widget: ['missing'] });
  });

  test('should allow partial resolution when enabled', () => {
    const registry = new Map([
      ['good', { metadata: {} }],
      ['bad', { metadata: { dependencies: ['missing'] } }],
    ]);

    const result = resolveDependencies(registry, { allowPartial: true });

    expect(result.success).toBe(true);
    expect(result.order).toEqual(['good']);
    expect(result.missingDeps).toEqual({ bad: ['missing'] });
  });

  test('should return empty order for empty registry', () => {
    const registry = new Map();
    const result = resolveDependencies(registry);

    expect(result.success).toBe(true);
    expect(result.order).toEqual([]);
  });

  test('should check version constraints', () => {
    const registry = new Map([
      ['dep', { metadata: { version: '1.0.0' } }],
      ['widget', { metadata: { dependencies: [{ id: 'dep', version: '>=2.0.0' }] } }],
    ]);

    const result = resolveDependencies(registry);

    expect(result.success).toBe(false);
    expect(result.error).toContain('constraint');
    expect(result.constraintViolations).toBeDefined();
  });

  test('should skip version check when requested', () => {
    const registry = new Map([
      ['dep', { metadata: { version: '1.0.0' } }],
      ['widget', { metadata: { dependencies: [{ id: 'dep', version: '>=2.0.0' }] } }],
    ]);

    const result = resolveDependencies(registry, { skipVersionCheck: true });

    expect(result.success).toBe(true);
  });
});

describe('getAllDependencies', () => {
  test('should return all transitive dependencies', () => {
    const registry = new Map([
      ['a', { metadata: {} }],
      ['b', { metadata: { dependencies: ['a'] } }],
      ['c', { metadata: { dependencies: ['b'] } }],
    ]);

    const graph = buildDependencyGraph(registry);
    const deps = getAllDependencies(graph, 'c');

    expect(deps).toContain('a');
    expect(deps).toContain('b');
    expect(deps).not.toContain('c');
  });

  test('should handle widgets with no dependencies', () => {
    const registry = new Map([
      ['a', { metadata: {} }],
    ]);

    const graph = buildDependencyGraph(registry);
    const deps = getAllDependencies(graph, 'a');

    expect(deps).toEqual([]);
  });

  test('should optionally exclude optional dependencies', () => {
    const registry = new Map([
      ['required', { metadata: {} }],
      ['optional', { metadata: {} }],
      ['widget', { metadata: { dependencies: ['required', { id: 'optional', optional: true }] } }],
    ]);

    const graph = buildDependencyGraph(registry);
    const depsWithOptional = getAllDependencies(graph, 'widget', { includeOptional: true });
    const depsWithoutOptional = getAllDependencies(graph, 'widget', { includeOptional: false });

    expect(depsWithOptional).toContain('optional');
    expect(depsWithoutOptional).not.toContain('optional');
  });
});

describe('getAllDependents', () => {
  test('should return all widgets that depend on given widget', () => {
    const registry = new Map([
      ['a', { metadata: {} }],
      ['b', { metadata: { dependencies: ['a'] } }],
      ['c', { metadata: { dependencies: ['b'] } }],
    ]);

    const graph = buildDependencyGraph(registry);
    const dependents = getAllDependents(graph, 'a');

    expect(dependents).toContain('b');
    expect(dependents).toContain('c');
    expect(dependents).not.toContain('a');
  });

  test('should return empty array for widgets with no dependents', () => {
    const registry = new Map([
      ['a', { metadata: {} }],
      ['b', { metadata: { dependencies: ['a'] } }],
    ]);

    const graph = buildDependencyGraph(registry);
    const dependents = getAllDependents(graph, 'b');

    expect(dependents).toEqual([]);
  });
});

describe('validateWidgetDependencies', () => {
  test('should return valid for widget with no dependencies', () => {
    const registry = new Map([
      ['widget', { metadata: {} }],
    ]);

    const result = validateWidgetDependencies(registry, 'widget');

    expect(result.valid).toBe(true);
    expect(result.dependencies).toEqual([]);
  });

  test('should return valid when all dependencies satisfied', () => {
    const registry = new Map([
      ['dep', { metadata: { version: '1.0.0' } }],
      ['widget', { metadata: { dependencies: [{ id: 'dep', version: '1.0.0' }] } }],
    ]);

    const result = validateWidgetDependencies(registry, 'widget');

    expect(result.valid).toBe(true);
    expect(result.dependencies).toEqual(['dep']);
  });

  test('should return invalid for missing dependency', () => {
    const registry = new Map([
      ['widget', { metadata: { dependencies: ['missing'] } }],
    ]);

    const result = validateWidgetDependencies(registry, 'widget');

    expect(result.valid).toBe(false);
    expect(result.error).toContain('Missing');
  });

  test('should return invalid for version constraint violation', () => {
    const registry = new Map([
      ['dep', { metadata: { version: '1.0.0' } }],
      ['widget', { metadata: { dependencies: [{ id: 'dep', version: '>=2.0.0' }] } }],
    ]);

    const result = validateWidgetDependencies(registry, 'widget');

    expect(result.valid).toBe(false);
    expect(result.error).toContain('does not satisfy');
  });

  test('should return not found for non-existent widget', () => {
    const registry = new Map();

    const result = validateWidgetDependencies(registry, 'nonexistent');

    expect(result.valid).toBe(false);
    expect(result.error).toContain('not found');
  });

  test('should return all transitive dependencies', () => {
    const registry = new Map([
      ['base', { metadata: {} }],
      ['mid', { metadata: { dependencies: ['base'] } }],
      ['top', { metadata: { dependencies: ['mid'] } }],
    ]);

    const result = validateWidgetDependencies(registry, 'top');

    expect(result.valid).toBe(true);
    expect(result.allDependencies).toContain('base');
    expect(result.allDependencies).toContain('mid');
  });
});
