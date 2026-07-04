import { exec } from 'child_process';

const POWERSHELL_KEY_MAP: Record<string, string> = {
  ctrl: '^',
  control: '^',
  alt: '%',
  shift: '+',
  meta: '^',
  cmd: '^',
  win: '^',
  enter: '{ENTER}',
  return: '{ENTER}',
  escape: '{ESC}',
  esc: '{ESC}',
  space: ' ',
  tab: '{TAB}',
  backspace: '{BACKSPACE}',
  delete: '{DELETE}',
  del: '{DELETE}',
  up: '{UP}',
  down: '{DOWN}',
  left: '{LEFT}',
  right: '{RIGHT}',
  f1: '{F1}',
  f2: '{F2}',
  f3: '{F3}',
  f4: '{F4}',
  f5: '{F5}',
  f6: '{F6}',
  f7: '{F7}',
  f8: '{F8}',
  f9: '{F9}',
  f10: '{F10}',
  f11: '{F11}',
  f12: '{F12}',
  home: '{HOME}',
  end: '{END}',
  pageup: '{PGUP}',
  page_up: '{PGUP}',
  pagedown: '{PGDN}',
  page_down: '{PGDN}',
  insert: '{INSERT}',
  pause: '{BREAK}',
  printscreen: '{PRTSC}',
};

function convertToPowerShellKey(key: string): string {
  const lowerKey = key.toLowerCase();
  if (POWERSHELL_KEY_MAP[lowerKey]) {
    return POWERSHELL_KEY_MAP[lowerKey];
  }
  if (lowerKey.length === 1) {
    if (/[a-z]/.test(lowerKey)) {
      return lowerKey.toUpperCase();
    }
    if (/[0-9]/.test(lowerKey)) {
      return lowerKey;
    }
  }
  return `{${key.toUpperCase()}}`;
}

export class HotkeyManager {
  async pressHotkey(keys: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const psKeys = keys.map(convertToPowerShellKey).join('');

        const command = `powershell -Command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.SendKeys]::SendWait('${psKeys}')"`;

        exec(command, (error, stdout, stderr) => {
          if (error) {
            console.error('Hotkey error:', error);
            reject(error);
            return;
          }
          resolve();
        });
      } catch (error) {
        console.error('Hotkey error:', error);
        reject(error);
      }
    });
  }

  async typeString(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const escapedText = text.replace(/'/g, "''");
        const command = `powershell -Command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.SendKeys]::SendWait('${escapedText}')"`;

        exec(command, (error) => {
          if (error) {
            console.error('TypeString error:', error);
            reject(error);
            return;
          }
          resolve();
        });
      } catch (error) {
        console.error('TypeString error:', error);
        reject(error);
      }
    });
  }
}
