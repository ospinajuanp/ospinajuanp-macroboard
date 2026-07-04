import { ServerConfig } from '@ospinajuanp-macroboard/shared';
import * as fs from 'fs';
import * as path from 'path';

export const CONFIG_PATH = path.join(process.cwd(), 'config.json');

export const DEFAULT_CONFIG: ServerConfig = {
  grid: {
    rows: 4,
    columns: 3,
  },
  buttons: {},
  obs: {
    host: 'localhost',
    port: 4455,
    password: 'Cualquiera1234',
  },
};

export function loadConfig(): ServerConfig {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const data = fs.readFileSync(CONFIG_PATH, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading config:', error);
  }
  return DEFAULT_CONFIG;
}

export function saveConfig(config: ServerConfig): void {
  try {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
  } catch (error) {
    console.error('Error saving config:', error);
  }
}
