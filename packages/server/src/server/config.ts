import { ServerConfig } from '@ospinajuanp-macroboard/shared';
import * as fs from 'fs';
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
  try {
    if (fs.existsSync(configPath)) {
      const data = fs.readFileSync(configPath, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading config:', error);
  }
  return DEFAULT_CONFIG;
}

export function saveConfig(config: ServerConfig): void {
  const configPath = getConfigPath();
  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  } catch (error) {
    console.error('Error saving config:', error);
  }
}
