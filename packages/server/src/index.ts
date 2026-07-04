import { ServerConfig } from '@ospinajuanp-macroboard/shared';

export const DEFAULT_CONFIG: ServerConfig = {
  grid: {
    rows: 4,
    columns: 3,
  },
  buttons: {},
  obs: {
    host: 'localhost',
    port: 4455,
    password: '',
  },
};

export const CONFIG_PATH = './config.json';
