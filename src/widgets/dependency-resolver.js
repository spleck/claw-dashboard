/**
 * Widget Dependency Resolver
 * Provides topological sorting, circular dependency detection, and constraint checking
 */

/**
 * Represents a dependency with optional constraints
 * @typedef {Object} Dependency
 * @property {string} id - Widget ID that is depended on
 * @property {boolean} [optional=false] - Whether this dependency is optional
 * @property {string} [version] - Optional version constraint (semver range)
 */

/**
 * Result of dependency resolution
 * @typedef {Object} ResolutionResult
 * @property {boolean} success - Whether resolution succeeded
 * @property {string[]} order - Topologically sorted widget IDs in load order
 * @property {string} [error] - Error message if resolution failed
 * @property {string[]} [circularPath] - Path of circular dependency if detected
 * @property {Object} [missingDeps] - Map of widget ID to missing dependency IDs
 * @property {Object} [constraintViolations] - Map of widget ID to constraint violations
 */

/**
 * Graph node representing a widget and its dependencies
 * @typedef {Object} DependencyNode
 * @property {string} id - Widget ID
 * @property {Dependency[]} dependencies - Parsed dependencies
 * @property {number} inDegree - Number of incoming edges (for Kahn's algorithm)
 * @property {Set<string>} dependents - Widgets that depend on this one
 */

/**
 * Parse a dependency specification which can be:
 * - A simple string (widget ID)
 * - An object with { id, optional, version }
 * @param {string|Object} dep - Dependency specification
 * @returns {Dependency} Parsed dependency object
 */
export function parseDependency(dep) {
  if (typeof dep === 'string') {
    return { id: dep, optional: false };
  }

  if (typeof dep === 'object' && dep !== null) {
    if (!dep.id || typeof dep.id !== 'string') {
      throw new Error('Dependency object must have a string "id" property');
    }
    return {
      id: dep.id,
      optional: dep.optional === true,
      version: dep.version,
    };
  }

  throw new Error('Dependency must be a string or an object with an "id" property');
}

/**
 * Parse all dependencies from a widget's metadata
 * @param {Object} metadata - Widget metadata
 * @returns {Dependency[]} Array of parsed dependencies
 */
export function parseDependencies(metadata) {
  if (!metadata.dependencies || !Array.isArray(metadata.dependencies)) {
    return [];
  }

  const deps = [];
  for (const dep of metadata.dependencies) {
    try {
      deps.push(parseDependency(dep));
    } catch (err) {
      // Log warning but don't fail - skip invalid dependencies
      console.warn(`Invalid dependency format in widget "${metadata.id || 'unknown'}": ${err.message}`);
    }
  }
  return deps;
}

/**
 * Build a dependency graph from widget registry
 * @param {Map<string, Object>} registry - Widget registry
 * @returns {Map<string, DependencyNode>} Dependency graph
 */
export function buildDependencyGraph(registry) {
  const graph = new Map();

  // Create nodes for all registered widgets
  for (const [id, widget] of registry) {
    const deps = parseDependencies(widget.metadata || {});
    graph.set(id, {
      id,
      dependencies: deps,
      inDegree: 0,
      dependents: new Set(),
    });
  }

  // Build edges and calculate in-degrees
  for (const [id, node] of graph) {
    for (const dep of node.dependencies) {
      const depNode = graph.get(dep.id);
      if (depNode) {
        depNode.dependents.add(id);
        node.inDegree++;
      }
    }
  }

  return graph;
}

/**
 * Detect circular dependencies using DFS
 * @param {Map<string, DependencyNode>} graph - Dependency graph
 * @returns {string[]|null} Circular path if found, null otherwise
 */
export function detectCircularDependency(graph) {
  const visited = new Set();
  const recStack = new Set();
  const path = [];

  function dfs(nodeId) {
    visited.add(nodeId);
    recStack.add(nodeId);
    path.push(nodeId);

    const node = graph.get(nodeId);
    if (node) {
      for (const dep of node.dependencies) {
        const depId = dep.id;

        if (!visited.has(depId)) {
          const cycle = dfs(depId);
          if (cycle) return cycle;
        } else if (recStack.has(depId)) {
          // Found a cycle - extract the circular portion of the path
          const cycleStart = path.indexOf(depId);
          return [...path.slice(cycleStart), depId];
        }
      }
    }

    path.pop();
    recStack.delete(nodeId);
    return null;
  }

  for (const [id] of graph) {
    if (!visited.has(id)) {
      const cycle = dfs(id);
      if (cycle) return cycle;
    }
  }

  return null;
}

/**
 * Check if a version satisfies a constraint (basic semver range support)
 * Supported formats:
 * - "1.0.0" - exact version
 * - ">=1.0.0" - greater than or equal
 * - "^1.0.0" - compatible with (same major)
 * - "~1.0.0" - approximately equivalent (same major.minor)
 * @param {string} version - Actual version
 * @param {string} constraint - Version constraint
 * @returns {boolean} Whether version satisfies constraint
 */
export function satisfiesVersion(version, constraint) {
  if (!version || !constraint) return true;

  const parseVersion = (v) => {
    const parts = v.replace(/^[=v]+/, '').split('.').map(Number);
    return {
      major: parts[0] || 0,
      minor: parts[1] || 0,
      patch: parts[2] || 0,
    };
  };

  const v = parseVersion(version);
  const c = parseVersion(constraint.replace(/^[>=^~]+/, ''));

  // Handle different constraint types
  if (constraint.startsWith('>=')) {
    if (v.major < c.major) return false;
    if (v.major === c.major && v.minor < c.minor) return false;
    if (v.major === c.major && v.minor === c.minor && v.patch < c.patch) return false;
    return true;
  }

  if (constraint.startsWith('^')) {
    // Compatible with major version
    if (v.major !== c.major) return false;
    if (v.major === 0) {
      // For 0.x.x, minor must match too
      if (v.minor < c.minor) return false;
      if (v.minor === c.minor && v.patch < c.patch) return false;
    }
    return true;
  }

  if (constraint.startsWith('~')) {
    // Approximately equivalent (major.minor must match exactly)
    if (v.major !== c.major) return false;
    if (v.minor !== c.minor) return false;
    if (v.patch < c.patch) return false;
    return true;
  }

  // Exact version match
  return v.major === c.major && v.minor === c.minor && v.patch === c.patch;
}

/**
 * Check version constraints for all dependencies
 * @param {Map<string, DependencyNode>} graph - Dependency graph
 * @param {Map<string, Object>} registry - Widget registry
 * @returns {Object|null} Constraint violations map or null if all satisfied
 */
export function checkVersionConstraints(graph, registry) {
  const violations = {};

  for (const [id, node] of graph) {
    const widgetViolations = [];

    for (const dep of node.dependencies) {
      if (!dep.version) continue;

      const depWidget = registry.get(dep.id);
      if (!depWidget) continue; // Missing dependency - handled separately

      const depVersion = depWidget.metadata?.version;
      if (!depVersion) {
        widgetViolations.push({
          dependency: dep.id,
          constraint: dep.version,
          actual: 'unknown',
          reason: 'Dependency has no version specified',
        });
      } else if (!satisfiesVersion(depVersion, dep.version)) {
        widgetViolations.push({
          dependency: dep.id,
          constraint: dep.version,
          actual: depVersion,
          reason: `Version ${depVersion} does not satisfy constraint ${dep.version}`,
        });
      }
    }

    if (widgetViolations.length > 0) {
      violations[id] = widgetViolations;
    }
  }

  return Object.keys(violations).length > 0 ? violations : null;
}

/**
 * Find missing dependencies (non-optional ones)
 * @param {Map<string, DependencyNode>} graph - Dependency graph
 * @param {Map<string, Object>} registry - Widget registry
 * @returns {Object|null} Map of widget ID to missing dependency IDs
 */
export function findMissingDependencies(graph, registry) {
  const missing = {};

  for (const [id, node] of graph) {
    const missingDeps = [];

    for (const dep of node.dependencies) {
      if (!dep.optional && !registry.has(dep.id)) {
        missingDeps.push(dep.id);
      }
    }

    if (missingDeps.length > 0) {
      missing[id] = missingDeps;
    }
  }

  return Object.keys(missing).length > 0 ? missing : null;
}

/**
 * Topological sort using Kahn's algorithm
 * @param {Map<string, DependencyNode>} graph - Dependency graph
 * @param {string[]} [targetIds] - Specific widgets to sort (optional, sorts all if omitted)
 * @returns {string[]} Topologically sorted widget IDs
 */
export function topologicalSort(graph, targetIds = null) {
  // Create a copy of in-degrees since we'll modify them
  const inDegrees = new Map();
  for (const [id, node] of graph) {
    inDegrees.set(id, node.inDegree);
  }

  // If targetIds specified, only include those and their dependencies
  const includeSet = targetIds ? new Set(targetIds) : null;
  if (includeSet) {
    // Add all dependencies of target widgets to include set
    const queue = [...targetIds];
    const visited = new Set();

    for (const id of queue) {
      if (visited.has(id)) continue;
      visited.add(id);

      const node = graph.get(id);
      if (node) {
        for (const dep of node.dependencies) {
          if (graph.has(dep.id)) {
            includeSet.add(dep.id);
            queue.push(dep.id);
          }
        }
      }
    }
  }

  // Find all nodes with in-degree 0
  const queue = [];
  for (const [id, degree] of inDegrees) {
    if (degree === 0 && (!includeSet || includeSet.has(id))) {
      queue.push(id);
    }
  }

  // Sort queue for deterministic order (alphabetical)
  queue.sort();

  const result = [];

  while (queue.length > 0) {
    const id = queue.shift();
    result.push(id);

    const node = graph.get(id);
    if (node) {
      for (const dependentId of node.dependents) {
        if (includeSet && !includeSet.has(dependentId)) continue;

        const newDegree = inDegrees.get(dependentId) - 1;
        inDegrees.set(dependentId, newDegree);

        if (newDegree === 0) {
          // Insert in sorted position for deterministic order
          const insertIndex = queue.findIndex(x => x > dependentId);
          if (insertIndex === -1) {
            queue.push(dependentId);
          } else {
            queue.splice(insertIndex, 0, dependentId);
          }
        }
      }
    }
  }

  return result;
}

/**
 * Resolve dependencies and return load order
 * @param {Map<string, Object>} registry - Widget registry
 * @param {Object} options - Resolution options
 * @param {string[]} [options.targetIds] - Specific widgets to resolve (default: all)
 * @param {boolean} [options.skipVersionCheck=false] - Skip version constraint checking
 * @param {boolean} [options.allowPartial=false] - Allow partial resolution (skip widgets with missing deps)
 * @returns {ResolutionResult} Resolution result with load order or error
 */
export function resolveDependencies(registry, options = {}) {
  const { targetIds = null, skipVersionCheck = false, allowPartial = false } = options;

  // Handle empty registry
  if (registry.size === 0) {
    return {
      success: true,
      order: [],
    };
  }

  // Build dependency graph
  const graph = buildDependencyGraph(registry);

  // Detect circular dependencies
  const circularPath = detectCircularDependency(graph);
  if (circularPath) {
    return {
      success: false,
      order: [],
      error: `Circular dependency detected: ${circularPath.join(' -> ')}`,
      circularPath,
    };
  }

  // Check for missing dependencies
  const missingDeps = findMissingDependencies(graph, registry);
  if (missingDeps && !allowPartial) {
    const details = Object.entries(missingDeps)
      .map(([id, deps]) => `"${id}" requires: ${deps.join(', ')}`)
      .join('; ');

    return {
      success: false,
      order: [],
      error: `Missing required dependencies: ${details}`,
      missingDeps,
    };
  }

  // Check version constraints
  if (!skipVersionCheck) {
    const violations = checkVersionConstraints(graph, registry);
    if (violations) {
      const details = Object.entries(violations)
        .map(([id, v]) => `"${id}": ${v.map(x => x.reason).join(', ')}`)
        .join('; ');

      return {
        success: false,
        order: [],
        error: `Version constraint violations: ${details}`,
        constraintViolations: violations,
      };
    }
  }

  // Get topological sort
  const idsToSort = targetIds || Array.from(registry.keys());
  const order = topologicalSort(graph, idsToSort);

  // If allowPartial, filter out widgets with missing dependencies
  let finalOrder = order;
  if (allowPartial && missingDeps) {
    const widgetsWithMissingDeps = new Set(Object.keys(missingDeps));
    finalOrder = order.filter(id => !widgetsWithMissingDeps.has(id));
  }

  return {
    success: true,
    order: finalOrder,
    ...(missingDeps && { missingDeps }),
  };
}

/**
 * Get all dependencies (direct and transitive) for a widget
 * @param {Map<string, DependencyNode>} graph - Dependency graph
 * @param {string} widgetId - Widget ID
 * @param {Object} options - Options
 * @param {boolean} [options.includeOptional=true] - Include optional dependencies
 * @returns {string[]} Array of dependency IDs in dependency order
 */
export function getAllDependencies(graph, widgetId, options = {}) {
  const { includeOptional = true } = options;
  const deps = new Set();
  const visited = new Set();

  function collect(id) {
    if (visited.has(id)) return;
    visited.add(id);

    const node = graph.get(id);
    if (!node) return;

    for (const dep of node.dependencies) {
      if (!includeOptional && dep.optional) continue;

      deps.add(dep.id);
      collect(dep.id);
    }
  }

  collect(widgetId);
  return Array.from(deps);
}

/**
 * Get all widgets that depend on a given widget (direct and indirect)
 * @param {Map<string, DependencyNode>} graph - Dependency graph
 * @param {string} widgetId - Widget ID
 * @returns {string[]} Array of dependent widget IDs
 */
export function getAllDependents(graph, widgetId) {
  const dependents = new Set();
  const visited = new Set();

  function collect(id) {
    if (visited.has(id)) return;
    visited.add(id);

    const node = graph.get(id);
    if (!node) return;

    for (const depId of node.dependents) {
      dependents.add(depId);
      collect(depId);
    }
  }

  collect(widgetId);
  return Array.from(dependents);
}

/**
 * Check if loading a widget would violate any dependency constraints
 * @param {Map<string, Object>} registry - Widget registry
 * @param {string} widgetId - Widget to check
 * @returns {Object} Validation result
 */
export function validateWidgetDependencies(registry, widgetId) {
  const graph = buildDependencyGraph(registry);
  const node = graph.get(widgetId);

  if (!node) {
    return {
      valid: false,
      error: `Widget "${widgetId}" not found in registry`,
    };
  }

  // Check for missing dependencies
  const missing = [];
  for (const dep of node.dependencies) {
    if (!dep.optional && !registry.has(dep.id)) {
      missing.push(dep.id);
    }
  }

  if (missing.length > 0) {
    return {
      valid: false,
      error: `Missing required dependencies: ${missing.join(', ')}`,
      missing,
    };
  }

  // Check for circular dependencies if this widget were loaded
  const circularPath = detectCircularDependency(graph);
  if (circularPath && circularPath.includes(widgetId)) {
    return {
      valid: false,
      error: `Circular dependency detected: ${circularPath.join(' -> ')}`,
      circularPath,
    };
  }

  // Check version constraints
  for (const dep of node.dependencies) {
    if (!dep.version) continue;

    const depWidget = registry.get(dep.id);
    if (!depWidget) continue;

    const depVersion = depWidget.metadata?.version;
    if (!depVersion) {
      return {
        valid: false,
        error: `Dependency "${dep.id}" has no version for constraint "${dep.version}"`,
        constraintViolation: { dependency: dep.id, constraint: dep.version, actual: null },
      };
    }

    if (!satisfiesVersion(depVersion, dep.version)) {
      return {
        valid: false,
        error: `Dependency "${dep.id}" version ${depVersion} does not satisfy constraint ${dep.version}`,
        constraintViolation: { dependency: dep.id, constraint: dep.version, actual: depVersion },
      };
    }
  }

  return {
    valid: true,
    dependencies: node.dependencies.map(d => d.id),
    allDependencies: getAllDependencies(graph, widgetId),
  };
}

export default {
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
};
