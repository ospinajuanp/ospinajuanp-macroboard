export interface GridConfig {
  rows: number;
  columns: number;
}

export interface Button {
  id: string;
  row: number;
  column: number;
  icon: string;
  action: ActionType;
  payload: string;
  label?: string;
  color?: string;
}

export type ActionType = 'OBS_SCENE' | 'HOTKEY' | 'MACRO';

export interface OBSAction {
  type: 'OBS_SCENE';
  sceneName: string;
}

export interface HotkeyAction {
  type: 'HOTKEY';
  keys: string[];
}

export interface ServerConfig {
  grid: GridConfig;
  buttons: Record<string, Button>;
  obs: {
    host: string;
    port: number;
    password: string;
  };
}

export interface WSClientMessage {
  type: 'TRIGGER' | 'CONFIG_UPDATE';
  buttonId?: string;
  action?: ActionType;
  payload?: string;
  grid?: GridConfig;
  buttons?: Record<string, Button>;
}

export interface WSServerMessage {
  type: 'ACTION_ACK' | 'OBS_STATE' | 'CONFIG_UPDATE';
  buttonId?: string;
  success?: boolean;
  micMuted?: boolean;
  recording?: boolean;
  streaming?: boolean;
  currentScene?: string;
  grid?: GridConfig;
  buttons?: Record<string, Button>;
}
