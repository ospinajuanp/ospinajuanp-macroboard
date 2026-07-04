/* eslint-disable @typescript-eslint/no-explicit-any */
import OBSWebSocket from 'obs-websocket-js';
import { ServerConfig } from '@ospinajuanp-macroboard/shared';

export interface OBSState {
  connected: boolean;
  currentScene: string | null;
  recording: boolean;
  streaming: boolean;
  micMuted: boolean;
}

export type OBSStateCallback = (state: OBSState) => void;

export class OBSClient {
  private obs: OBSWebSocket;
  private config: ServerConfig['obs'];
  private state: OBSState = {
    connected: false,
    currentScene: null,
    recording: false,
    streaming: false,
    micMuted: false,
  };
  private callbacks: OBSStateCallback[] = [];
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor(config: ServerConfig['obs']) {
    this.config = config;
    this.obs = new OBSWebSocket();
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    (this.obs as any).on('ConnectionOpened', () => {
      console.log('[OBS] WebSocket connected');
      this.updateState({ connected: true });
      this.reconnectAttempts = 0;
    });

    (this.obs as any).on('ConnectionClosed', () => {
      console.log('[OBS] WebSocket disconnected');
      this.updateState({ connected: false });
      this.scheduleReconnect();
    });

    (this.obs as any).on('Identified', () => {
      console.log('[OBS] Authentication successful');
    });

    (this.obs as any).on('CurrentProgramSceneChanged', (data: any) => {
      this.updateState({ currentScene: data.sceneName || null });
    });

    (this.obs as any).on('StreamStateChanged', (data: any) => {
      this.updateState({ streaming: data.outputActive });
    });

    (this.obs as any).on('RecordingStateChanged', (data: any) => {
      this.updateState({ recording: data.outputActive });
    });

    (this.obs as any).on('InputMuteStateChanged', (data: any) => {
      const micNames = ['mic', 'audio', 'microphone'];
      const isMic = micNames.some((name) =>
        data.inputName.toLowerCase().includes(name)
      );
      if (isMic) {
        this.updateState({ micMuted: data.inputMuted });
      }
    });

    (this.obs as any).on('ConnectionError', (error: any) => {
      console.error('[OBS] Connection error:', error);
    });
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('[OBS] Max reconnect attempts reached, giving up');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * this.reconnectAttempts, 10000);

    console.log(`[OBS] Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`);

    this.reconnectTimeout = setTimeout(() => {
      this.connect().catch((err) => {
        console.error('[OBS] Reconnect failed:', err);
      });
    }, delay);
  }

  private updateState(partial: Partial<OBSState>): void {
    this.state = { ...this.state, ...partial };
    this.callbacks.forEach((cb) => cb(this.state));
  }

  async connect(): Promise<void> {
    try {
      console.log(`[OBS] Connecting to ws://${this.config.host}:${this.config.port}`);
      await this.obs.connect(`ws://${this.config.host}:${this.config.port}`, this.config.password);
    } catch (error: any) {
      console.error('[OBS] Failed to connect:', error?.message || error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    await this.obs.disconnect();
  }

  async setScene(sceneName: string): Promise<void> {
    try {
      await this.obs.call('SetCurrentProgramScene', { sceneName });
    } catch (error) {
      console.error('Failed to set scene:', error);
      throw error;
    }
  }

  async toggleMic(): Promise<void> {
    try {
      const { inputs }: any = await this.obs.call('GetInputList', { inputKind: 'audio_input' });
      const micInput = inputs?.find(
        (i: any) =>
          i.inputName.toLowerCase().includes('mic') ||
          i.inputName.toLowerCase().includes('audio')
      );

      if (micInput) {
        await this.obs.call('ToggleInputMute', { inputName: micInput.inputName });
      }
    } catch (error) {
      console.error('Failed to toggle mic:', error);
      throw error;
    }
  }

  async toggleRecord(): Promise<void> {
    try {
      await this.obs.call('ToggleRecord');
    } catch (error) {
      console.error('Failed to toggle record:', error);
      throw error;
    }
  }

  async toggleStream(): Promise<void> {
    try {
      await this.obs.call('ToggleStream');
    } catch (error) {
      console.error('Failed to toggle stream:', error);
      throw error;
    }
  }

  getState(): OBSState {
    return this.state;
  }

  isConnected(): boolean {
    return this.state.connected;
  }

  onStateChange(callback: OBSStateCallback): void {
    this.callbacks.push(callback);
  }
}
