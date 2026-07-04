import { GridConfig, Button, ActionType } from '@ospinajuanp-macroboard/shared';

export interface AdminConfig {
  grid: GridConfig;
  buttons: Record<string, Button>;
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

export interface GridPreviewProps {
  rows: number;
  columns: number;
  buttons: Record<string, Button>;
  onButtonClick: (row: number, column: number) => void;
}

export type ConnectionStatus = 'connected' | 'disconnected' | 'connecting';
