import * as path from 'path';
import * as os from 'os';

export function isPackaged(): boolean {
  return process.env.PKG_EXECPATH !== undefined ||
         (process as any).pkg !== undefined ||
         process.execPath.endsWith('.exe');
}

export function getBasePath(): string {
  if (isPackaged()) {
    return path.dirname(process.execPath);
  }
  return process.cwd();
}

export function getConfigPath(): string {
  if (isPackaged()) {
    const appDataPath = path.join(os.homedir(), 'AppData', 'Roaming', 'ospinajuanp-macroboard');
    return path.join(appDataPath, 'config.json');
  }
  return path.join(getBasePath(), 'config.json');
}

export function getStaticPath(): string {
  return path.join(getBasePath(), 'static');
}
