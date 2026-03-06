/**
 * Tests for builtin-widgets.js
 * Covers widget classes and their methods
 */

import { jest } from '@jest/globals';
import { describe, test, expect, beforeEach } from '@jest/globals';

// Create base mock object with key method
const createMockBlessedElement = () => ({
  setContent: jest.fn(),
  style: { border: { fg: '' } },
  key: jest.fn()
});

// Mock blessed before importing
jest.unstable_mockModule('blessed', () => ({
  default: {
    box: jest.fn().mockReturnValue(createMockBlessedElement()),
    text: jest.fn().mockReturnValue(createMockBlessedElement()),
    list: jest.fn().mockReturnValue({
      ...createMockBlessedElement(),
      setItems: jest.fn(),
      select: jest.fn(),
      focus: jest.fn()
    })
  }
}));

// Import after mocking
const blessed = await import('blessed');
const builtin = await import('../src/widgets/builtin-widgets.js');

describe('Builtin Widgets', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('CpuWidget', () => {
    test('should create CpuWidget instance', () => {
      const widget = new builtin.CpuWidget();
      expect(widget.name).toBe('CPU');
      expect(widget.description).toBe('CPU usage and history');
      expect(widget.history).toEqual([]);
      expect(widget.maxHistory).toBe(60);
    });

    test('should create widget UI elements', async () => {
      const widget = new builtin.CpuWidget();
      const mockScreen = {};
      const theme = { colors: { cyan: 'cyan', brightGreen: 'bright-green', gray: 'gray' } };
      
      await widget.create(mockScreen, theme);
      
      expect(blessed.default.box).toHaveBeenCalled();
      expect(blessed.default.text).toHaveBeenCalledTimes(2);
      expect(widget.box).toBeDefined();
      expect(widget.valueText).toBeDefined();
      expect(widget.detailText).toBeDefined();
    });

    test('should get data from dataProvider', async () => {
      const widget = new builtin.CpuWidget();
      const mockProvider = jest.fn().mockResolvedValue({ avg: 50, cores: 4 });
      
      const result = await widget.getData(mockProvider);
      
      expect(mockProvider).toHaveBeenCalledWith('cpu');
      expect(result).toEqual({ avg: 50, cores: 4 });
    });

    test('should update display with data', async () => {
      const widget = new builtin.CpuWidget();
      const mockScreen = {};
      const theme = { colors: { cyan: 'cyan', brightGreen: 'bright-green', gray: 'gray' } };
      
      await widget.create(mockScreen, theme);
      
      widget.update({ avg: 75, cores: 8 });
      
      expect(widget.history.length).toBe(1);
      expect(widget.history[0]).toBe(75);
    });

    test('should handle missing data gracefully', async () => {
      const widget = new builtin.CpuWidget();
      const mockScreen = {};
      const theme = { colors: { cyan: 'cyan' } };
      
      await widget.create(mockScreen, theme);
      
      // Should not throw
      widget.update(null);
      widget.update(undefined);
      widget.update({});
    });

    test('should limit history to maxHistory', () => {
      const widget = new builtin.CpuWidget();
      widget.maxHistory = 3;
      // Mock required properties for update to work
      widget.box = { setContent: jest.fn() };
      widget.valueText = { setContent: jest.fn() };
      widget.detailText = { setContent: jest.fn() };
      
      widget.update({ avg: 10 });
      widget.update({ avg: 20 });
      widget.update({ avg: 30 });
      widget.update({ avg: 40 });
      
      expect(widget.history.length).toBe(3);
      expect(widget.history).toEqual([20, 30, 40]);
    });

    test('should getData return null when no provider', async () => {
      const widget = new builtin.CpuWidget();
      const result = await widget.getData(null);
      expect(result).toBeNull();
    });

    test('should render call update', async () => {
      const widget = new builtin.CpuWidget();
      const mockScreen = {};
      const theme = { colors: { cyan: 'cyan', brightGreen: 'bright-green', gray: 'gray' } };
      
      await widget.create(mockScreen, theme);
      
      const data = { avg: 50, cores: 4 };
      widget.render(data);
      
      expect(widget.history.length).toBe(1);
    });
  });

  describe('MemoryWidget', () => {
    test('should create MemoryWidget instance', () => {
      const widget = new builtin.MemoryWidget();
      expect(widget.name).toBe('Memory');
      expect(widget.description).toBe('Memory usage and history');
    });

    test('should create widget UI elements', async () => {
      const widget = new builtin.MemoryWidget();
      const mockScreen = {};
      const theme = { colors: { magenta: 'magenta', brightMagenta: 'bright-magenta', gray: 'gray' } };
      
      await widget.create(mockScreen, theme);
      
      expect(blessed.default.box).toHaveBeenCalled();
      expect(widget.box).toBeDefined();
    });

    test('should update with memory data', async () => {
      const widget = new builtin.MemoryWidget();
      const mockScreen = {};
      const theme = { colors: { magenta: 'magenta', brightMagenta: 'bright-magenta', gray: 'gray' } };
      
      await widget.create(mockScreen, theme);
      
      widget.update({ percent: 75, used: 8, total: 16 });
      
      expect(widget.history.length).toBe(1);
      expect(widget.history[0]).toBe(75);
    });

    test('should getData call provider with memory', async () => {
      const widget = new builtin.MemoryWidget();
      const mockProvider = jest.fn().mockResolvedValue({ percent: 50 });
      
      await widget.getData(mockProvider);
      
      expect(mockProvider).toHaveBeenCalledWith('memory');
    });
  });

  describe('GpuWidget', () => {
    test('should create GpuWidget instance', () => {
      const widget = new builtin.GpuWidget();
      expect(widget.name).toBe('GPU');
      expect(widget.description).toBe('GPU usage and temperature');
    });

    test('should create widget UI', async () => {
      const widget = new builtin.GpuWidget();
      const mockScreen = {};
      const theme = { colors: { yellow: 'yellow', brightYellow: 'bright-yellow', gray: 'gray' } };
      
      await widget.create(mockScreen, theme);
      
      expect(blessed.default.box).toHaveBeenCalled();
      expect(blessed.default.text).toHaveBeenCalledTimes(2);
    });

    test('should getData call provider with gpu', async () => {
      const widget = new builtin.GpuWidget();
      const mockProvider = jest.fn().mockResolvedValue({ name: 'Test GPU' });
      
      await widget.getData(mockProvider);
      
      expect(mockProvider).toHaveBeenCalledWith('gpu');
    });
  });

  describe('DiskWidget', () => {
    test('should create DiskWidget instance', () => {
      const widget = new builtin.DiskWidget();
      expect(widget.name).toBe('Disk');
      expect(widget.description).toBe('Disk usage');
    });

    test('should create widget UI', async () => {
      const widget = new builtin.DiskWidget();
      const mockScreen = {};
      const theme = { colors: { green: 'green', brightGreen: 'bright-green', gray: 'gray' } };
      
      await widget.create(mockScreen, theme);
      
      expect(blessed.default.box).toHaveBeenCalled();
      expect(widget.box).toBeDefined();
    });

    test('should getData call provider with disk', async () => {
      const widget = new builtin.DiskWidget();
      const mockProvider = jest.fn().mockResolvedValue({ used: 50, size: 100 });
      
      await widget.getData(mockProvider);
      
      expect(mockProvider).toHaveBeenCalledWith('disk');
    });

    test('should update with disk data', async () => {
      const widget = new builtin.DiskWidget();
      const mockScreen = {};
      const theme = { colors: { green: 'green', brightGreen: 'bright-green', gray: 'gray' } };
      
      await widget.create(mockScreen, theme);
      
      widget.update({ percent: 60, used: '60GB', size: '100GB' });
      
      expect(widget.valueText.setContent).toHaveBeenCalled();
    });
  });

  describe('SystemWidget', () => {
    test('should create SystemWidget instance', () => {
      const widget = new builtin.SystemWidget();
      expect(widget.name).toBe('System');
      expect(widget.description).toBe('System information');
    });

    test('should create widget UI', async () => {
      const widget = new builtin.SystemWidget();
      const mockScreen = {};
      const theme = { colors: { blue: 'blue', brightBlue: 'bright-blue', gray: 'gray' } };
      
      await widget.create(mockScreen, theme);
      
      expect(blessed.default.box).toHaveBeenCalled();
    });

    test('should getData call provider with system', async () => {
      const widget = new builtin.SystemWidget();
      const mockProvider = jest.fn().mockResolvedValue({ platform: 'darwin' });
      
      await widget.getData(mockProvider);
      
      expect(mockProvider).toHaveBeenCalledWith('system');
    });

    test('should update with system data', async () => {
      const widget = new builtin.SystemWidget();
      const mockScreen = {};
      const theme = { colors: { blue: 'blue', brightBlue: 'bright-blue', gray: 'gray' } };
      
      await widget.create(mockScreen, theme);
      
      widget.update({ platform: 'darwin', release: '14.0', arch: 'arm64', isContainer: false });
      
      expect(widget.line1.setContent).toHaveBeenCalledWith('darwin 14.0');
      expect(widget.line2.setContent).toHaveBeenCalledWith('arm64');
    });
  });

  describe('UptimeWidget', () => {
    test('should create UptimeWidget instance', () => {
      const widget = new builtin.UptimeWidget();
      expect(widget.name).toBe('Uptime');
      expect(widget.description).toBe('System and OpenClaw uptime');
    });

    test('should create widget UI', async () => {
      const widget = new builtin.UptimeWidget();
      const mockScreen = {};
      const theme = { colors: { white: 'white', brightWhite: 'bright-white', gray: 'gray' } };
      
      await widget.create(mockScreen, theme);
      
      expect(blessed.default.box).toHaveBeenCalled();
    });
  });

  describe('DataHealthWidget', () => {
    test('should create DataHealthWidget instance', () => {
      const widget = new builtin.DataHealthWidget();
      expect(widget.name).toBe('Data Health');
      expect(widget.description).toBe('Data freshness indicators');
    });

    test('should create widget UI', async () => {
      const widget = new builtin.DataHealthWidget();
      const mockScreen = {};
      const theme = { colors: { red: 'red', brightRed: 'bright-red', green: 'green', brightGreen: 'bright-green' } };
      
      await widget.create(mockScreen, theme);
      
      expect(blessed.default.box).toHaveBeenCalled();
    });
  });

  describe('SettingsWidget', () => {
    test('should create SettingsWidget instance', () => {
      const widget = new builtin.SettingsWidget();
      expect(widget.name).toBe('Settings');
      expect(widget.description).toBe('User preferences configuration');
    });

    test('should create widget UI', async () => {
      const widget = new builtin.SettingsWidget();
      const mockScreen = {};
      const theme = { colors: { cyan: 'cyan', brightCyan: 'bright-cyan', gray: 'gray' } };
      
      await widget.create(mockScreen, theme);
      
      expect(blessed.default.box).toHaveBeenCalled();
      expect(blessed.default.text).toHaveBeenCalled();
    });
  });

  describe('GatewayStatusWidget', () => {
    test('should create GatewayStatusWidget instance', () => {
      const widget = new builtin.GatewayStatusWidget();
      expect(widget.name).toBe('Gateway Status');
      expect(widget.description).toBe('Gateway connection status and health');
    });

    test('should create widget UI', async () => {
      const widget = new builtin.GatewayStatusWidget();
      const mockScreen = {};
      const theme = { colors: { yellow: 'yellow', brightYellow: 'bright-yellow', gray: 'gray' } };
      
      await widget.create(mockScreen, theme);
      
      expect(blessed.default.box).toHaveBeenCalled();
    });
  });

  describe('WIDGET_REGISTRY', () => {
    test('should contain expected widgets', () => {
      expect(builtin.WIDGET_REGISTRY).toHaveProperty('cpu');
      expect(builtin.WIDGET_REGISTRY).toHaveProperty('memory');
      expect(builtin.WIDGET_REGISTRY).toHaveProperty('gpu');
      expect(builtin.WIDGET_REGISTRY).toHaveProperty('disk');
      expect(builtin.WIDGET_REGISTRY).toHaveProperty('system');
      expect(builtin.WIDGET_REGISTRY).toHaveProperty('uptime');
      expect(builtin.WIDGET_REGISTRY).toHaveProperty('dataHealth');
      expect(builtin.WIDGET_REGISTRY).toHaveProperty('settings');
    });

    test('should NOT contain NetworkWidget', () => {
      expect(builtin.WIDGET_REGISTRY).not.toHaveProperty('network');
    });

    test('all widgets should extend BaseWidget', () => {
      const widgets = [
        builtin.CpuWidget,
        builtin.MemoryWidget,
        builtin.GpuWidget,
        builtin.DiskWidget,
        builtin.SystemWidget,
        builtin.UptimeWidget,
        builtin.DataHealthWidget,
        builtin.SettingsWidget,
        builtin.GatewayStatusWidget
      ];
      
      for (const WidgetClass of widgets) {
        const widget = new WidgetClass();
        expect(widget.name).toBeDefined();
        expect(widget.description).toBeDefined();
      }
    });
  });
});
