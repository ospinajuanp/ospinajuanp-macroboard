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
    del: 'delete',
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
    numlock: 'numlock',
    num_lock: 'numlock',
    pause: 'pause',
    break: 'pause',
    printscreen: 'print',
    print: 'print',
    sysreq: 'print',
    insert: 'insert',
    home: 'home',
    end: 'end',
    pageup: 'pageup',
    page_up: 'pageup',
    pagedown: 'pagedown',
    page_down: 'pagedown',
    numpad_0: 'numpad0',
    numpad_1: 'numpad1',
    numpad_2: 'numpad2',
    numpad_3: 'numpad3',
    numpad_4: 'numpad4',
    numpad_5: 'numpad5',
    numpad_6: 'numpad6',
    numpad_7: 'numpad7',
    numpad_8: 'numpad8',
    numpad_9: 'numpad9',
    numpad_add: 'numpad_add',
    numpad_subtract: 'numpad_sub',
    numpad_multiply: 'numpad_mult',
    numpad_divide: 'numpad_div',
    numpad_enter: 'numpad_enter',
    numpad_decimal: 'numpad_dot',
    numpad_dot: 'numpad_dot',
    numpad_separator: 'numpad_separator',
    backquote: 'backquote',
    quotes: 'quote',
    apostrophe: "'",
    minus: 'minus',
    underscore: 'minus',
    equal: 'equal',
    plus: 'equal',
    bracket_left: 'bracket_left',
    bracket_right: 'bracket_right',
    braces_left: 'bracket_left',
    braces_right: 'bracket_right',
    backslash: 'backslash',
    pipe: 'backslash',
    semicolon: 'semicolon',
    colon: 'semicolon',
    comma: 'comma',
    less: 'comma',
    period: 'period',
    greater: 'period',
    slash: 'slash',
    question: 'slash',
  };

  isAvailable(): boolean {
    return robot !== null;
  }

  async pressHotkey(keys: string[]): Promise<void> {
    if (!robot) {
      throw new Error('RobotJS no esta disponible');
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
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Hotkey no soportado: ${keys.join('+')} - ${errorMessage}`);
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
