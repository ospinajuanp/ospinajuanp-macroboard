let robot: typeof import('robotjs') | null = null;

try {
  robot = require('robotjs');
} catch (error) {
  console.warn('robotjs not available, hotkeys disabled');
}

export interface HotkeyConfig {
  keys: string[];
}

export class HotkeyManager {
  private keyMap: Record<string, string> = {
    ctrl: 'control',
    control: 'control',
    alt: 'alt',
    shift: 'shift',
    meta: 'command',
    cmd: 'command',
    win: 'command',
    enter: 'enter',
    return: 'enter',
    escape: 'escape',
    esc: 'escape',
    space: 'space',
    tab: 'tab',
    backspace: 'backspace',
    delete: 'delete',
    up: 'up',
    down: 'down',
    left: 'left',
    right: 'right',
    f1: 'f1',
    f2: 'f2',
    f3: 'f3',
    f4: 'f4',
    f5: 'f5',
    f6: 'f6',
    f7: 'f7',
    f8: 'f8',
    f9: 'f9',
    f10: 'f10',
    f11: 'f11',
    f12: 'f12',
  };

  isAvailable(): boolean {
    return robot !== null;
  }

  async pressHotkey(keys: string[]): Promise<void> {
    if (!robot) {
      console.warn('robotjs not available, cannot press hotkey');
      return;
    }

    try {
      const normalizedKeys = keys.map((k) => this.keyMap[k.toLowerCase()] || k.toLowerCase());

      const downKeys = normalizedKeys.slice(0, -1);
      const finalKey = normalizedKeys[normalizedKeys.length - 1];

      for (const key of downKeys) {
        robot.keyToggle(key, 'down');
      }

      robot.keyTap(finalKey);

      for (const key of downKeys.reverse()) {
        robot.keyToggle(key, 'up');
      }
    } catch (error) {
      console.error('Failed to press hotkey:', error);
      throw error;
    }
  }

  async typeString(text: string): Promise<void> {
    if (!robot) {
      console.warn('robotjs not available, cannot type string');
      return;
    }

    try {
      robot.typeString(text);
    } catch (error) {
      console.error('Failed to type string:', error);
      throw error;
    }
  }
}
