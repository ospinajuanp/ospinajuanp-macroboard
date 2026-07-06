import { ServerConfig } from '@ospinajuanp-macroboard/shared';
import * as fs from 'fs';
import * as path from 'path';
import { getConfigPath } from './paths';

export const DEFAULT_CONFIG: ServerConfig = {
  buttons: [],
  obs: {
    host: 'localhost',
    port: 4455,
    password: 'Cualquiera1234',
  },
};

export function loadConfig(): ServerConfig {
  const configPath = getConfigPath();
  console.log(`[Config] Loading from: ${configPath}`);

  try {
    if (fs.existsSync(configPath)) {
      const data = fs.readFileSync(configPath, 'utf-8');
      const parsed = JSON.parse(data);
      console.log(`[Config] Loaded successfully (${parsed.buttons?.length || 0} buttons)`);
      return parsed;
    } else {
      console.log('[Config] No config file found, using defaults');
    }
  } catch (error) {
    console.error('[Config] Error loading config:', error);
    console.log('[Config] Using default config');
  }
  return DEFAULT_CONFIG;
}

export function saveConfig(config: ServerConfig): void {
  const configPath = getConfigPath();
  const configDir = path.dirname(configPath);

  try {
    if (!fs.existsSync(configDir)) {
      console.log(`[Config] Creating config directory: ${configDir}`);
      fs.mkdirSync(configDir, { recursive: true });
    }

    const backupPath = `${configPath}.backup`;
    if (fs.existsSync(configPath)) {
      fs.copyFileSync(configPath, backupPath);
      console.log(`[Config] Backup created: ${backupPath}`);
    }

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log(`[Config] Saved to: ${configPath}`);
  } catch (error) {
    console.error('[Config] Error saving config:', error);
  }
}
