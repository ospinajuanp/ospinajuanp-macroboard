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
  private pollInterval: NodeJS.Timeout | null = null;

  constructor(config: ServerConfig['obs']) {
    this.config = config;
    this.obs = new OBSWebSocket();
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.obs.on('ConnectionOpened', () => {
      console.log('OBS WebSocket connected');
      this.updateState({ connected: true });
      this.startPolling();
    });

    this.obs.on('ConnectionClosed', () => {
      console.log('OBS WebSocket disconnected');
      this.updateState({ connected: false });
      this.stopPolling();
    });

    this.obs.on('SwitchScenes', (data: any) => {
      this.updateState({ currentScene: data['scene-name'] });
    });

    this.obs.on('StreamStarted', () => {
      this.updateState({ streaming: true });
    });

    this.obs.on('StreamStopped', () => {
      this.updateState({ streaming: false });
    });

    this.obs.on('RecordingStarted', () => {
      this.updateState({ recording: true });
    });

    this.obs.on('RecordingStopped', () => {
      this.updateState({ recording: false });
    });
  }

  private async pollMicState(): Promise<void> {
    try {
      const response: any = await (this.obs as any).send('GetInputMute', { inputName: 'Mic/Audio' });
      this.updateState({ micMuted: response.inputMuted });
    } catch {
      try {
        const response: any = await (this.obs as any).send('GetInputMute', { inputName: 'Audio Input Capture' });
        this.updateState({ micMuted: response.inputMuted });
      } catch {
        // Mic input not found, ignore
      }
    }
  }

  private startPolling(): void {
    this.pollMicState();
    this.pollInterval = setInterval(() => this.pollMicState(), 5000);
  }

  private stopPolling(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  private updateState(partial: Partial<OBSState>): void {
    this.state = { ...this.state, ...partial };
    this.callbacks.forEach((cb) => cb(this.state));
  }

  async connect(): Promise<void> {
    try {
      await this.obs.connect({
        address: `${this.config.host}:${this.config.port}`,
        password: this.config.password,
      });
    } catch (error) {
      console.error('Failed to connect to OBS:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    this.stopPolling();
    await this.obs.disconnect();
  }

  async setScene(sceneName: string): Promise<void> {
    try {
      await (this.obs as any).send('SetCurrentProgramScene', { 'scene-name': sceneName });
    } catch (error) {
      console.error('Failed to set scene:', error);
      throw error;
    }
  }

  async toggleMic(): Promise<boolean> {
    try {
      await (this.obs as any).send('ToggleInputMute', { inputName: 'Mic/Audio' });
      return !this.state.micMuted;
    } catch (error) {
      console.error('Failed to toggle mic:', error);
      throw error;
    }
  }

  getState(): OBSState {
    return this.state;
  }

  onStateChange(callback: OBSStateCallback): void {
    this.callbacks.push(callback);
  }
}
