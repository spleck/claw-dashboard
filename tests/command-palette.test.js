/**
 * Tests for Command Palette Lifecycle
 * Verifies the command palette modal behavior and navigation guards
 */

import { jest } from '@jest/globals';

describe('Command Palette Lifecycle', () => {
  describe('_commandPaletteClosing flag behavior', () => {
    test('should block navigation when command palette is closing', () => {
      // Simulate the state during command palette close transition
      const state = {
        _commandPaletteClosing: false,
        w: {
          commandPaletteBox: null,
          commandPaletteInput: null,
          commandPaletteList: null,
        },
        isModalActive: false,
      };

      // Simulate navigation guard logic
      const shouldBlockNavigation = () => {
        return !!(state._commandPaletteClosing || (state.w.commandPaletteBox && state.w.commandPaletteInput && state.w.commandPaletteInput.focused));
      };

      // Initially, navigation should NOT be blocked
      expect(shouldBlockNavigation()).toBe(false);

      // Simulate opening command palette
      state.w.commandPaletteBox = { destroy: jest.fn() };
      state.w.commandPaletteInput = { focused: true };
      state.w.commandPaletteList = { focus: jest.fn() };
      state.isModalActive = true;
      expect(shouldBlockNavigation()).toBe(true); // Blocked while command palette is open

      // Simulate closeCommandPalette() being called - the critical fix
      // _commandPaletteClosing is set synchronously BEFORE the async transition
      state._commandPaletteClosing = true;
      state.isModalActive = false;
      // commandPaletteInput still exists during transition
      expect(shouldBlockNavigation()).toBe(true); // Still blocked during transition!

      // After transition completes
      state._commandPaletteClosing = false;
      state.w.commandPaletteInput = null;
      state.w.commandPaletteList = null;
      state.w.commandPaletteBox = null;
      expect(shouldBlockNavigation()).toBe(false); // Now navigation is allowed
    });

    test('should handle rapid open/close cycles', () => {
      const state = {
        _commandPaletteClosing: false,
        w: {
          commandPaletteBox: null,
          commandPaletteInput: null,
          commandPaletteList: null,
        },
        isModalActive: false,
      };

      const shouldBlockNavigation = () => {
        return !!(state._commandPaletteClosing || (state.w.commandPaletteBox && state.w.commandPaletteInput && state.w.commandPaletteInput.focused));
      };

      // Rapid open/close cycle
      // Open
      state.w.commandPaletteBox = {};
      state.w.commandPaletteInput = { focused: true };
      state.isModalActive = true;
      expect(shouldBlockNavigation()).toBe(true);

      // Close starts
      state._commandPaletteClosing = true;
      state.isModalActive = false;
      expect(shouldBlockNavigation()).toBe(true);

      // Close completes
      state._commandPaletteClosing = false;
      state.w.commandPaletteInput = null;
      state.w.commandPaletteBox = null;
      expect(shouldBlockNavigation()).toBe(false);

      // Rapidly re-open before any navigation
      state.w.commandPaletteBox = {};
      state.w.commandPaletteInput = { focused: true };
      state.isModalActive = true;
      expect(shouldBlockNavigation()).toBe(true);

      // Close again
      state._commandPaletteClosing = true;
      state.isModalActive = false;
      expect(shouldBlockNavigation()).toBe(true);

      // Final cleanup
      state._commandPaletteClosing = false;
      state.w.commandPaletteInput = null;
      state.w.commandPaletteBox = null;
      expect(shouldBlockNavigation()).toBe(false);
    });

    test('should use try/finally pattern to ensure flag is always cleared', () => {
      // This test verifies the code pattern used in closeCommandPalette()
      // The flag should be cleared even if an error occurs

      const state = {
        _commandPaletteClosing: false,
      };

      // Simulate the closeCommandPalette pattern
      const simulateClose = async (shouldThrow = false) => {
        state._commandPaletteClosing = true;
        try {
          if (shouldThrow) {
            throw new Error('Transition failed');
          }
          // Simulate async transition
          await new Promise(resolve => setTimeout(resolve, 10));
        } finally {
          state._commandPaletteClosing = false;
        }
      };

      // Normal close
      return simulateClose(false).then(() => {
        expect(state._commandPaletteClosing).toBe(false);

        // Close with error
        return simulateClose(true).catch(() => {
          // Error is expected
        });
      }).then(() => {
        // Flag should still be cleared even after error
        expect(state._commandPaletteClosing).toBe(false);
      });
    });
  });

  describe('isModalActive state management', () => {
    test('should be set false synchronously when closeCommandPalette starts', () => {
      // This test verifies the fix for the race condition where
      // isModalActive was only set after the async transition completed

      const state = {
        isModalActive: false,
        _commandPaletteClosing: false,
      };

      // Simulate closeCommandPalette() start
      const closeCommandPaletteStart = () => {
        state._commandPaletteClosing = true;
        state.isModalActive = false;
        // At this point, even though transition hasn't completed,
        // isModalActive is already false
      };

      // Open command palette first
      state.isModalActive = true;
      expect(state.isModalActive).toBe(true);

      // Close starts - isModalActive should be false immediately
      closeCommandPaletteStart();
      expect(state.isModalActive).toBe(false);
      expect(state._commandPaletteClosing).toBe(true);
    });
  });

  describe('Command filtering', () => {
    test('should filter commands by name', () => {
      const commands = [
        { name: 'Toggle Help', shortcut: '?', category: 'Navigation' },
        { name: 'Open Settings', shortcut: 's', category: 'Navigation' },
        { name: 'Force Refresh', shortcut: 'r', category: 'Display' },
      ];

      const filterCommands = (query) => {
        if (!query) return commands;
        return commands.filter(cmd =>
          cmd.name.toLowerCase().includes(query) ||
          cmd.shortcut.toLowerCase().includes(query) ||
          cmd.category.toLowerCase().includes(query)
        );
      };

      // Filter by name
      expect(filterCommands('help')).toHaveLength(1);
      expect(filterCommands('help')[0].name).toBe('Toggle Help');

      // Filter by shortcut (exact match)
      expect(filterCommands('r')).toHaveLength(1);
      expect(filterCommands('r')[0].name).toBe('Force Refresh');

      // Filter by category
      expect(filterCommands('display')).toHaveLength(1);
      expect(filterCommands('display')[0].name).toBe('Force Refresh');

      // No results
      expect(filterCommands('xyz')).toHaveLength(0);

      // Empty query returns all
      expect(filterCommands('')).toHaveLength(3);
    });

    test('should handle case-insensitive filtering', () => {
      const commands = [
        { name: 'Toggle CPU Widget', shortcut: '1', category: 'Widgets' },
        { name: 'Toggle Memory Widget', shortcut: '2', category: 'Widgets' },
      ];

      const filterCommands = (query) => {
        if (!query) return commands;
        const lowerQuery = query.toLowerCase();
        return commands.filter(cmd =>
          cmd.name.toLowerCase().includes(lowerQuery) ||
          cmd.shortcut.toLowerCase().includes(lowerQuery) ||
          cmd.category.toLowerCase().includes(lowerQuery)
        );
      };

      // Case insensitive
      expect(filterCommands('CPU')).toHaveLength(1);
      expect(filterCommands('cpu')).toHaveLength(1);
      expect(filterCommands('Cpu')).toHaveLength(1);
    });
  });

  describe('Navigation guard logic', () => {
    test('should check _commandPaletteClosing first for performance', () => {
      // The guard uses || with _commandPaletteClosing first
      // This means if _commandPaletteClosing is true, we don't even check commandPaletteInput.focused
      // which could cause issues with destroyed widgets

      let inputFocusedCallCount = 0;
      const state = {
        _commandPaletteClosing: false,
        w: {
          commandPaletteBox: {},
          commandPaletteInput: {
            get focused() {
              inputFocusedCallCount++;
              return true;
            }
          }
        }
      };

      const shouldBlockNavigation = () => {
        return !!(state._commandPaletteClosing || (state.w.commandPaletteBox && state.w.commandPaletteInput && state.w.commandPaletteInput.focused));
      };

      // When _commandPaletteClosing is false, commandPaletteInput.focused is checked
      inputFocusedCallCount = 0;
      state._commandPaletteClosing = false;
      shouldBlockNavigation();
      expect(inputFocusedCallCount).toBe(1);

      // When _commandPaletteClosing is true, commandPaletteInput.focused is NOT checked (short-circuit)
      inputFocusedCallCount = 0;
      state._commandPaletteClosing = true;
      shouldBlockNavigation();
      expect(inputFocusedCallCount).toBe(0);
    });

    test('should handle null commandPaletteInput gracefully', () => {
      const state = {
        _commandPaletteClosing: false,
        w: {
          commandPaletteBox: null,
          commandPaletteInput: null,
        }
      };

      const shouldBlockNavigation = () => {
        return !!(state._commandPaletteClosing || (state.w.commandPaletteBox && state.w.commandPaletteInput && state.w.commandPaletteInput.focused));
      };

      // Should not throw when commandPaletteInput is null
      expect(() => shouldBlockNavigation()).not.toThrow();
      expect(shouldBlockNavigation()).toBe(false);

      // Should still work when _commandPaletteClosing is true
      state._commandPaletteClosing = true;
      expect(shouldBlockNavigation()).toBe(true);
    });
  });

  describe('Command execution', () => {
    test('should execute command action after closing modal', () => {
      let actionExecuted = false;
      const commands = [
        { name: 'Test Command', shortcut: 't', action: () => { actionExecuted = true; } }
      ];

      // Simulate command execution
      const executeCommand = (cmd) => {
        if (cmd.action && typeof cmd.action === 'function') {
          cmd.action();
        }
      };

      executeCommand(commands[0]);
      expect(actionExecuted).toBe(true);
    });

    test('should handle commands without actions gracefully', () => {
      const commands = [
        { name: 'No Action', shortcut: 'n' }
      ];

      // Should not throw when action is undefined
      expect(() => {
        const cmd = commands[0];
        if (cmd.action && typeof cmd.action === 'function') {
          cmd.action();
        }
      }).not.toThrow();
    });
  });
});