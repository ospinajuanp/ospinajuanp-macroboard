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
