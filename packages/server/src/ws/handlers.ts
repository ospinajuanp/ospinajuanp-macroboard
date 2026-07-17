import { WebSocket } from 'ws';
import { Button, WSServerMessage, DEFAULT_BUTTONS } from '@ospinajuanp-macroboard/shared';
import {
  ConfigUpdateMessage,
  GetScenesMessage,
  TriggerMessage,
} from './schemas';
import { ButtonService, OBSController } from '../services/button.service';
import { ConfigService } from '../services/config.service';
import { Logger, createLogger } from '../lib/logger';
import { isAppError } from '../lib/errors';

export interface WSClient {
  id: string;
  ws: WebSocket;
  connected: boolean;
  clientType?: 'mobile' | 'admin';
}

export interface OBSStateProvider extends OBSController {
  getState(): {
    micMuted: boolean;
    recording: boolean;
    streaming: boolean;
    currentScene: string | null;
  };
  getScenes(): Promise<string[]>;
}

export interface HandlerDeps {
  buttons: ButtonService;
  config: ConfigService;
  obs: OBSStateProvider;
  broadcast: (message: WSServerMessage) => void;
  logger?: Logger;
}

export type TriggerResult = { success: boolean };

export async function handleTrigger(
  client: WSClient,
  message: TriggerMessage,
  deps: HandlerDeps,
): Promise<TriggerResult> {
  const log = (deps.logger ?? createLogger('ws-handlers')).child('trigger');
  try {
    await deps.buttons.execute(message.action, message.payload ?? '');
    send(client, { type: 'ACTION_ACK', buttonId: message.buttonId, success: true });
    return { success: true };
  } catch (err) {
    const reason = isAppError(err) ? err.message : err instanceof Error ? err.message : 'unknown';
    log.warn('Trigger failed', { action: message.action, reason });
    send(client, { type: 'ACTION_ACK', buttonId: message.buttonId, success: false });
    return { success: false };
  }
}

export function handleConfigUpdate(
  message: ConfigUpdateMessage,
  deps: HandlerDeps,
): void {
  const log = (deps.logger ?? createLogger('ws-handlers')).child('config');
  if (!message.buttons) {
    log.debug('Config update without buttons, ignoring');
    return;
  }
  deps.config.updateButtons(message.buttons);
  const allButtons: Button[] = [...DEFAULT_BUTTONS, ...message.buttons];
  deps.broadcast({ type: 'CONFIG_UPDATE', buttons: allButtons });
}

export async function handleGetScenes(
  client: WSClient,
  _message: GetScenesMessage,
  deps: HandlerDeps,
): Promise<void> {
  try {
    const scenes = await deps.obs.getScenes();
    send(client, { type: 'OBS_SCENES', scenes });
  } catch {
    send(client, { type: 'OBS_SCENES', scenes: [] });
  }
}

export function send(client: WSClient, message: WSServerMessage): void {
  if (client.connected && client.ws.readyState === WebSocket.OPEN) {
    client.ws.send(JSON.stringify(message));
  }
}

export function buildConfigUpdateMessage(buttons: readonly Button[]): WSServerMessage {
  return {
    type: 'CONFIG_UPDATE',
    buttons: [...DEFAULT_BUTTONS, ...buttons],
  };
}

export function buildOBSStateMessage(state: ReturnType<OBSStateProvider['getState']>): WSServerMessage {
  return {
    type: 'OBS_STATE',
    micMuted: state.micMuted,
    recording: state.recording,
    streaming: state.streaming,
    currentScene: state.currentScene || undefined,
  };
}