// Flat ESLint config. Minimal, no style rules that fight the codebase.
const nodeGlobals = Object.fromEntries([
  "AbortController", "Buffer", "WebSocket", "clearInterval", "clearTimeout",
  "console", "fetch", "globalThis", "performance", "process", "queueMicrotask",
  "setInterval", "setImmediate", "setTimeout", "structuredClone", "TextDecoder",
  "TextEncoder", "URL", "URLSearchParams",
].map((name) => [name, "readonly"]));

export default [
  { ignores: ["node_modules/**", "coverage/**", ".worktrees/**"] },
  {
    languageOptions: {
      ecmaVersion: 2025,
      sourceType: "module",
      globals: nodeGlobals,
    },
    rules: {
      "no-undef": "error",
      "no-unused-vars": ["error", { argsIgnorePattern: "^_$", caughtErrors: "none" }],
      "no-var": "error",
      "eqeqeq": ["warn", "smart"],
      "prefer-const": "warn",
      "no-constant-binary-expression": "error",
    },
  },
];
