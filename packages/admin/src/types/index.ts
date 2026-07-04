import { Button, ActionType } from '@ospinajuanp-macroboard/shared';

export interface AdminConfig {
  buttons: Button[];
  obs: {
    host: string;
    port: number;
    password: string;
  };
}

export interface ButtonEditorProps {
  button: Button | null;
  onSave: (button: Button) => void;
  onCancel: () => void;
}

export type ConnectionStatus = 'connected' | 'disconnected' | 'connecting';