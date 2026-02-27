/**
 * Container Environment Detection Module
 * Detects if running inside Docker, Kubernetes, or other containerized environments
 */

import fs from 'fs';
import os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';
import logger from './logger.js';

const execAsync = promisify(exec);

/**
 * Container environment types
 * @typedef {Object} ContainerEnvironment
 * @property {boolean} isContainer - Whether running in any container
 * @property {boolean} isDocker - Whether running in Docker
 * @property {boolean} isKubernetes - Whether running in Kubernetes
 * @property {boolean} isWSL - Whether running in Windows Subsystem for Linux
 * @property {string|null} containerId - Container ID if detected
 * @property {string|null} containerName - Container name if available
 * @property {string|null} podName - Kubernetes pod name if available
 * @property {string|null} namespace - Kubernetes namespace if available
 * @property {string} runtime - Detected container runtime (docker, containerd, cri-o, etc.)
 */

/**
 * Default container environment state
 * @type {ContainerEnvironment}
 */
const DEFAULT_CONTAINER_ENV = {
  isContainer: false,
  isDocker: false,
  isKubernetes: false,
  isWSL: false,
  containerId: null,
  containerName: null,
  podName: null,
  namespace: null,
  runtime: 'none'
};

/**
 * Cached container environment detection result
 * @type {ContainerEnvironment|null}
 */
let cachedContainerEnv = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 30000; // 30 seconds cache

/**
 * Check if running inside a Docker container by examining cgroup
 * @returns {Promise<boolean>}
 */
async function checkDockerCgroup() {
  try {
    const cgroupContent = fs.readFileSync('/proc/self/cgroup', 'utf8');
    return cgroupContent.includes('docker') ||
           cgroupContent.includes('containerd') ||
           cgroupContent.includes('crio') ||
           /[0-9a-f]{64}/.test(cgroupContent); // Container ID pattern
  } catch {
    return false;
  }
}

/**
 * Check if .dockerenv file exists (older Docker detection method)
 * @returns {boolean}
 */
function checkDockerEnvFile() {
  try {
    fs.accessSync('/.dockerenv', fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check for Kubernetes-specific environment variables and files
 * @returns {Promise<{isKubernetes: boolean, podName: string|null, namespace: string|null}>}
 */
async function checkKubernetes() {
  const result = {
    isKubernetes: false,
    podName: null,
    namespace: null
  };

  try {
    // Check for Kubernetes service account directory
    if (fs.existsSync('/var/run/secrets/kubernetes.io')) {
      result.isKubernetes = true;
    }

    // Check environment variables
    if (process.env.KUBERNETES_SERVICE_HOST || process.env.KUBERNETES_PORT) {
      result.isKubernetes = true;
    }

    // Get pod name from hostname (typically pod name in K8s)
    if (process.env.HOSTNAME) {
      // K8s hostnames often contain pod names
      const hostname = process.env.HOSTNAME;
      if (hostname.includes('-') && /[a-f0-9]{5,10}$/.test(hostname)) {
        result.podName = hostname;
      }
    }

    // Get namespace from service account namespace file
    try {
      const namespacePath = '/var/run/secrets/kubernetes.io/serviceaccount/namespace';
      if (fs.existsSync(namespacePath)) {
        result.namespace = fs.readFileSync(namespacePath, 'utf8').trim();
      }
    } catch {
      // Ignore read errors
    }

    // Also check env var
    if (!result.namespace && process.env.KUBERNETES_NAMESPACE) {
      result.namespace = process.env.KUBERNETES_NAMESPACE;
    }
  } catch {
    // Ignore errors
  }

  return result;
}

/**
 * Check if running in Windows Subsystem for Linux (WSL)
 * @returns {boolean}
 */
function checkWSL() {
  // Check for WSL in /proc/version
  try {
    const version = fs.readFileSync('/proc/version', 'utf8').toLowerCase();
    if (version.includes('microsoft') || version.includes('wsl')) {
      return true;
    }
  } catch {
    // Ignore errors
  }

  // Check for WSL-specific environment variable
  if (process.env.WSL_DISTRO_NAME || process.env.WSLENV) {
    return true;
  }

  // Check for Windows interop path
  try {
    if (fs.existsSync('/mnt/c/Windows')) {
      return true;
    }
  } catch {
    // Ignore errors
  }

  return false;
}

/**
 * Get container ID from cgroup
 * @returns {string|null}
 */
function getContainerId() {
  try {
    const cgroupContent = fs.readFileSync('/proc/self/cgroup', 'utf8');

    // Try to match container ID pattern (64 hex characters)
    const match = cgroupContent.match(/[0-9a-f]{64}/);
    if (match) {
      return match[0].substring(0, 12); // Short form like Docker
    }

    // Try alternative patterns for different container runtimes
    const lines = cgroupContent.split('\n');
    for (const line of lines) {
      // Match patterns like /docker/<id> or /containerd/<id>
      const dockerMatch = line.match(/\/docker\/([0-9a-f]{12,64})/i);
      if (dockerMatch) {
        return dockerMatch[1].substring(0, 12);
      }

      const containerdMatch = line.match(/\/containerd\/.*\/([0-9a-f]{12,64})/i);
      if (containerdMatch) {
        return containerdMatch[1].substring(0, 12);
      }

      const criMatch = line.match(/\/cri-containerd\/([0-9a-f]{12,64})/i);
      if (criMatch) {
        return criMatch[1].substring(0, 12);
      }
    }
  } catch {
    // Ignore errors
  }

  return null;
}

/**
 * Get container name from Docker if available
 * @returns {Promise<string|null>}
 */
async function getContainerName() {
  // Try environment variable first
  if (process.env.CONTAINER_NAME) {
    return process.env.CONTAINER_NAME;
  }

  if (process.env.HOSTNAME && !checkWSL()) {
    // In containers, hostname is often the container ID
    // But could also be a custom name
    return process.env.HOSTNAME;
  }

  return null;
}

/**
 * Detect container runtime from cgroup or process tree
 * @returns {Promise<string>}
 */
async function detectRuntime() {
  try {
    const cgroupContent = fs.readFileSync('/proc/self/cgroup', 'utf8');

    if (cgroupContent.includes('docker')) {
      return 'docker';
    }
    if (cgroupContent.includes('containerd')) {
      return 'containerd';
    }
    if (cgroupContent.includes('crio')) {
      return 'cri-o';
    }
    if (cgroupContent.includes('podman')) {
      return 'podman';
    }
    if (cgroupContent.includes('lxc')) {
      return 'lxc';
    }
    if (cgroupContent.includes('systemd-nspawn')) {
      return 'systemd-nspawn';
    }

    // Check if any container-specific files exist
    if (fs.existsSync('/run/containerd')) {
      return 'containerd';
    }
    if (fs.existsSync('/run/crio')) {
      return 'cri-o';
    }
    if (fs.existsSync('/run/docker.sock') || fs.existsSync('/var/run/docker.sock')) {
      // Can access Docker socket (might be mounted in container)
      return 'docker-accessible';
    }

    // Default to generic container if cgroup suggests it
    if (cgroupContent.includes('0::/') && cgroupContent.split('\n').length > 1) {
      return 'container';
    }
  } catch {
    // Ignore errors
  }

  return 'unknown';
}

/**
 * Detect containerized environment
 * @returns {Promise<ContainerEnvironment>}
 */
export async function detectContainerEnv() {
  // Return cached result if still valid
  const now = Date.now();
  if (cachedContainerEnv && (now - cacheTimestamp) < CACHE_TTL_MS) {
    return cachedContainerEnv;
  }

  const env = { ...DEFAULT_CONTAINER_ENV };

  // Skip detection on Windows (not containers in the Linux sense)
  const platform = os.platform();
  if (platform === 'win32') {
    return env;
  }

  try {
    // Check for Docker
    const [dockerCgroup, dockerEnvFile] = await Promise.all([
      checkDockerCgroup(),
      Promise.resolve(checkDockerEnvFile())
    ]);

    if (dockerCgroup || dockerEnvFile) {
      env.isContainer = true;
      env.isDocker = true;
      env.containerId = getContainerId();
      env.containerName = await getContainerName();
    }

    // Check for Kubernetes
    const k8sInfo = await checkKubernetes();
    if (k8sInfo.isKubernetes) {
      env.isContainer = true;
      env.isKubernetes = true;
      env.podName = k8sInfo.podName;
      env.namespace = k8sInfo.namespace;
    }

    // Check for WSL
    env.isWSL = checkWSL();

    // Detect runtime if in a container
    if (env.isContainer) {
      env.runtime = await detectRuntime();
    }

    // Cache result
    cachedContainerEnv = env;
    cacheTimestamp = now;

  } catch (err) {
    logger.warn(`Container detection failed: ${err.message}`);
  }

  return env;
}

/**
 * Get a human-readable description of the container environment
 * @param {ContainerEnvironment} env
 * @returns {string}
 */
export function getContainerDescription(env) {
  if (!env.isContainer) {
    return 'Bare Metal/VM';
  }

  const parts = [];

  if (env.isKubernetes) {
    parts.push('Kubernetes');
    if (env.namespace) {
      parts.push(`ns:${env.namespace}`);
    }
    if (env.podName) {
      const shortPod = env.podName.length > 20
        ? env.podName.substring(0, 17) + '...'
        : env.podName;
      parts.push(`pod:${shortPod}`);
    }
  } else if (env.isDocker) {
    parts.push('Docker');
    if (env.containerId) {
      parts.push(`id:${env.containerId}`);
    }
  } else {
    parts.push(env.runtime !== 'unknown' ? env.runtime : 'Container');
  }

  if (env.isWSL) {
    parts.push('(WSL)');
  }

  return parts.join(' ');
}

/**
 * Get short container indicator for system widget
 * @param {ContainerEnvironment} env
 * @returns {string}
 */
export function getContainerIndicator(env) {
  if (!env.isContainer) {
    return '';
  }

  if (env.isKubernetes) {
    return '☸ K8s';
  }
  if (env.isDocker) {
    return '🐳 Docker';
  }
  return '⬡ Container';
}

/**
 * Clear the container detection cache
 * Forces fresh detection on next call
 */
export function clearContainerCache() {
  cachedContainerEnv = null;
  cacheTimestamp = 0;
}

export default {
  detectContainerEnv,
  getContainerDescription,
  getContainerIndicator,
  clearContainerCache,
  DEFAULT_CONTAINER_ENV
};
