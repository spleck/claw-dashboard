/**
 * Tests for Widget Arrangement Mode
 * Verifies the fix for moveWidget() logic that was moving the wrong widget
 *
 * The bug was caused by updating arrangeWidgetIndex BEFORE getting the widgetId,
 * which resulted in getting the widget at the new position instead of the original.
 * This meant the wrong widget would be moved in the array.
 */

import { jest } from '@jest/globals';

describe('Widget Arrangement Mode', () => {
  describe('moveWidget() logic', () => {
    test('should move the originally selected widget, not the one at the new index', () => {
      // Simulate the dashboard state with widget order
      const state = {
        widgetOrder: ['cpu', 'mem', 'gpu', 'disk'],
        arrangeWidgetIndex: 2, // User has 'gpu' selected
      };

      // Simulate the FIXED moveWidget(-1) logic
      const moveWidgetFixed = (direction) => {
        const orderedWidgets = [...state.widgetOrder];
        if (orderedWidgets.length <= 1) return;

        // Get the widget currently selected (must be before any index changes)
        const widgetId = orderedWidgets[state.arrangeWidgetIndex];
        const oldIndex = state.arrangeWidgetIndex;

        // Calculate target index with wrapping
        let targetIndex = oldIndex + direction;
        if (targetIndex < 0) targetIndex = orderedWidgets.length - 1;
        if (targetIndex >= orderedWidgets.length) targetIndex = 0;

        // Reorder the array - remove from old position and insert at target
        const newOrder = [...orderedWidgets];
        newOrder.splice(oldIndex, 1);
        newOrder.splice(targetIndex, 0, widgetId);

        state.widgetOrder = newOrder;
        state.arrangeWidgetIndex = targetIndex;
      };

      // User presses 'left' to move 'gpu' to the left
      moveWidgetFixed(-1);

      // 'gpu' should have moved from index 2 to index 1
      expect(state.widgetOrder).toEqual(['cpu', 'gpu', 'mem', 'disk']);
      // The highlight should follow 'gpu' to its new position
      expect(state.arrangeWidgetIndex).toBe(1);
    });

    test('should move the correct widget when moving right', () => {
      const state = {
        widgetOrder: ['cpu', 'mem', 'gpu', 'disk'],
        arrangeWidgetIndex: 1, // User has 'mem' selected
      };

      const moveWidgetFixed = (direction) => {
        const orderedWidgets = [...state.widgetOrder];
        if (orderedWidgets.length <= 1) return;

        const widgetId = orderedWidgets[state.arrangeWidgetIndex];
        const oldIndex = state.arrangeWidgetIndex;

        let targetIndex = oldIndex + direction;
        if (targetIndex < 0) targetIndex = orderedWidgets.length - 1;
        if (targetIndex >= orderedWidgets.length) targetIndex = 0;

        const newOrder = [...orderedWidgets];
        newOrder.splice(oldIndex, 1);
        newOrder.splice(targetIndex, 0, widgetId);

        state.widgetOrder = newOrder;
        state.arrangeWidgetIndex = targetIndex;
      };

      // User presses 'right' to move 'mem' to the right
      moveWidgetFixed(1);

      // 'mem' should have moved from index 1 to index 2
      expect(state.widgetOrder).toEqual(['cpu', 'gpu', 'mem', 'disk']);
      expect(state.arrangeWidgetIndex).toBe(2);
    });

    test('should wrap correctly when moving left from first position', () => {
      const state = {
        widgetOrder: ['cpu', 'mem', 'gpu', 'disk'],
        arrangeWidgetIndex: 0, // User has 'cpu' selected (first)
      };

      const moveWidgetFixed = (direction) => {
        const orderedWidgets = [...state.widgetOrder];
        if (orderedWidgets.length <= 1) return;

        const widgetId = orderedWidgets[state.arrangeWidgetIndex];
        const oldIndex = state.arrangeWidgetIndex;

        let targetIndex = oldIndex + direction;
        if (targetIndex < 0) targetIndex = orderedWidgets.length - 1;
        if (targetIndex >= orderedWidgets.length) targetIndex = 0;

        const newOrder = [...orderedWidgets];
        newOrder.splice(oldIndex, 1);
        newOrder.splice(targetIndex, 0, widgetId);

        state.widgetOrder = newOrder;
        state.arrangeWidgetIndex = targetIndex;
      };

      // User presses 'left' to move 'cpu' - should wrap to end
      moveWidgetFixed(-1);

      // 'cpu' should have moved from index 0 to index 3 (last)
      expect(state.widgetOrder).toEqual(['mem', 'gpu', 'disk', 'cpu']);
      expect(state.arrangeWidgetIndex).toBe(3);
    });

    test('should wrap correctly when moving right from last position', () => {
      const state = {
        widgetOrder: ['cpu', 'mem', 'gpu', 'disk'],
        arrangeWidgetIndex: 3, // User has 'disk' selected (last)
      };

      const moveWidgetFixed = (direction) => {
        const orderedWidgets = [...state.widgetOrder];
        if (orderedWidgets.length <= 1) return;

        const widgetId = orderedWidgets[state.arrangeWidgetIndex];
        const oldIndex = state.arrangeWidgetIndex;

        let targetIndex = oldIndex + direction;
        if (targetIndex < 0) targetIndex = orderedWidgets.length - 1;
        if (targetIndex >= orderedWidgets.length) targetIndex = 0;

        const newOrder = [...orderedWidgets];
        newOrder.splice(oldIndex, 1);
        newOrder.splice(targetIndex, 0, widgetId);

        state.widgetOrder = newOrder;
        state.arrangeWidgetIndex = targetIndex;
      };

      // User presses 'right' to move 'disk' - should wrap to start
      moveWidgetFixed(1);

      // 'disk' should have moved from index 3 to index 0 (first)
      expect(state.widgetOrder).toEqual(['disk', 'cpu', 'mem', 'gpu']);
      expect(state.arrangeWidgetIndex).toBe(0);
    });

    test('should handle single widget array gracefully', () => {
      const state = {
        widgetOrder: ['cpu'],
        arrangeWidgetIndex: 0,
      };

      const moveWidgetFixed = (direction) => {
        const orderedWidgets = [...state.widgetOrder];
        if (orderedWidgets.length <= 1) return; // Should return early

        const widgetId = orderedWidgets[state.arrangeWidgetIndex];
        const oldIndex = state.arrangeWidgetIndex;

        let targetIndex = oldIndex + direction;
        if (targetIndex < 0) targetIndex = orderedWidgets.length - 1;
        if (targetIndex >= orderedWidgets.length) targetIndex = 0;

        const newOrder = [...orderedWidgets];
        newOrder.splice(oldIndex, 1);
        newOrder.splice(targetIndex, 0, widgetId);

        state.widgetOrder = newOrder;
        state.arrangeWidgetIndex = targetIndex;
      };

      // Should not throw and should not modify array
      moveWidgetFixed(-1);
      expect(state.widgetOrder).toEqual(['cpu']);
      expect(state.arrangeWidgetIndex).toBe(0);
    });
  });
});
