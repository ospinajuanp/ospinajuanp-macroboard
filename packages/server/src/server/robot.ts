import { keyboard, Key } from '@nut-tree-fork/nut-js';

const KEY_MAP: Record<string, Key> = {
  ctrl: Key.LeftControl,
  control: Key.LeftControl,
  alt: Key.LeftAlt,
  shift: Key.LeftShift,
  meta: Key.LeftSuper,
  cmd: Key.LeftSuper,
  win: Key.LeftSuper,
  enter: Key.Enter,
  return: Key.Enter,
  escape: Key.Escape,
  esc: Key.Escape,
  space: Key.Space,
  tab: Key.Tab,
  backspace: Key.Backspace,
  delete: Key.Delete,
  del: Key.Delete,
  up: Key.Up,
  down: Key.Down,
  left: Key.Left,
  right: Key.Right,
  f1: Key.F1,
  f2: Key.F2,
  f3: Key.F3,
  f4: Key.F4,
  f5: Key.F5,
  f6: Key.F6,
  f7: Key.F7,
  f8: Key.F8,
  f9: Key.F9,
  f10: Key.F10,
  f11: Key.F11,
  f12: Key.F12,
  home: Key.Home,
  end: Key.End,
  pageup: Key.PageUp,
  page_up: Key.PageUp,
  pagedown: Key.PageDown,
  page_down: Key.PageDown,
  insert: Key.Insert,
};

function getKeyFromMap(key: string): Key {
  const lowerKey = key.toLowerCase();
  if (KEY_MAP[lowerKey]) {
    return KEY_MAP[lowerKey];
  }
  if (lowerKey.length === 1) {
    const upperKey = lowerKey.toUpperCase();
    if (upperKey in Key) {
      return Key[upperKey as keyof typeof Key];
    }
  }
  return Key.Space;
}

export class HotkeyManager {
  async pressHotkey(keys: string[]): Promise<void> {
    try {
      const normalizedKeys = keys.map(getKeyFromMap);

      for (const key of normalizedKeys.slice(0, -1)) {
        await keyboard.pressKey(key);
      }

      const finalKey = normalizedKeys[normalizedKeys.length - 1];
      await keyboard.releaseKey(finalKey);

      for (const key of normalizedKeys.slice(0, -1).reverse()) {
        await keyboard.releaseKey(key);
      }
    } catch (error) {
      console.error('Error pressing hotkey:', error);
      throw error;
    }
  }

  async typeString(text: string): Promise<void> {
    try {
      await keyboard.type(text);
    } catch (error) {
      console.error('Error typing string:', error);
    }
  }
}
