export interface Button {
  id: string;
  icon: string;
  action: ActionType;
  payload: string;
  label?: string;
  color?: string;
}

export type ActionType = 'OBS_SCENE' | 'OBS_MUTE' | 'OBS_RECORD' | 'OBS_STREAM' | 'HOTKEY' | 'MACRO';

export interface OBSAction {
  type: 'OBS_SCENE';
  sceneName: string;
}

export interface HotkeyAction {
  type: 'HOTKEY';
  keys: string[];
}

export interface ServerConfig {
  buttons: Button[];
  autoOpen?: boolean;
  obs: {
    host: string;
    port: number;
    password: string;
  };
}

export interface WSClientMessage {
  type: 'TRIGGER' | 'CONFIG_UPDATE' | 'CLIENT_TYPE' | 'GET_SCENES';
  buttonId?: string;
  action?: ActionType;
  payload?: string;
  buttons?: Button[];
  clientType?: 'mobile' | 'admin';
}

export interface WSServerMessage {
  type: 'ACTION_ACK' | 'OBS_STATE' | 'CONFIG_UPDATE' | 'OBS_SCENES';
  buttonId?: string;
  success?: boolean;
  obsConnected?: boolean;
  obsReconnecting?: boolean;
  micMuted?: boolean;
  recording?: boolean;
  streaming?: boolean;
  currentScene?: string;
  buttons?: Button[];
  scenes?: string[];
}

export const DEFAULT_BUTTONS: readonly Button[] = Object.freeze([
  { id: 'default_record', icon: 'stop', action: 'OBS_RECORD', payload: '', label: 'Rec', color: 'bg-red-600' },
  { id: 'default_stream', icon: 'play', action: 'OBS_STREAM', payload: '', label: 'Stream', color: 'bg-red-600' },
]);

export function isDefaultButton(button: Button): boolean {
  return button.id.startsWith('default_');
}

export function splitButtons(buttons: readonly Button[]): { defaults: Button[]; user: Button[] } {
  const defaults: Button[] = [];
  const user: Button[] = [];
  for (const b of buttons) {
    if (isDefaultButton(b)) defaults.push(b);
    else user.push(b);
  }
  return { defaults, user };
}
