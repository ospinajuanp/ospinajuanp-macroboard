import { ActionType } from '@ospinajuanp-macroboard/shared';
import { ServiceUnavailableError } from '../lib/errors';
import { createLogger, Logger } from '../lib/logger';

export interface OBSController {
  isConnected(): boolean;
  setScene(sceneName: string): Promise<void>;
  toggleMic(): Promise<void>;
  toggleRecord(): Promise<void>;
  toggleStream(): Promise<void>;
}

export interface HotkeyController {
  pressHotkey(keys: string[]): Promise<void>;
}

export interface ButtonServiceDeps {
  obs: OBSController;
  hotkeys: HotkeyController;
  logger?: Logger;
}

export class ButtonService {
  private readonly obs: OBSController;
  private readonly hotkeys: HotkeyController;
  private readonly logger: Logger;

  constructor(deps: ButtonServiceDeps) {
    this.obs = deps.obs;
    this.hotkeys = deps.hotkeys;
    this.logger = (deps.logger ?? createLogger('button-service')).child('exec');
  }

  async execute(action: ActionType, payload: string): Promise<void> {
    this.logger.info('Executing action', { action, payloadLength: payload.length });

    switch (action) {
      case 'OBS_SCENE':
        await this.obs.setScene(payload);
        return;

      case 'OBS_MUTE':
        if (!this.obs.isConnected()) {
          throw new ServiceUnavailableError('OBS not connected');
        }
        await this.obs.toggleMic();
        return;

      case 'OBS_RECORD':
        if (!this.obs.isConnected()) {
          throw new ServiceUnavailableError('OBS not connected');
        }
        await this.obs.toggleRecord();
        return;

      case 'OBS_STREAM':
        if (!this.obs.isConnected()) {
          throw new ServiceUnavailableError('OBS not connected');
        }
        await this.obs.toggleStream();
        return;

      case 'HOTKEY': {
        const keys = payload.split('+').map((k) => k.trim()).filter(Boolean);
        await this.hotkeys.pressHotkey(keys);
        return;
      }

      case 'MACRO':
        this.logger.warn('MACRO action is a no-op in current version', { macro: payload });
        return;

      default: {
        const exhaustive: never = action;
        throw new Error(`Unhandled action: ${String(exhaustive)}`);
      }
    }
  }
}