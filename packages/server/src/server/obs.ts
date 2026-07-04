/* eslint-disable @typescript-eslint/no-explicit-any */
import OBSWebSocket from 'obs-websocket-js';
import { ServerConfig } from '@ospinajuanp-macroboard/shared';

export interface OBSState {
  connected: boolean;
  reconnecting: boolean;
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
    reconnecting: false,
    currentScene: null,
    recording: false,
    streaming: false,
    micMuted: false,
  };
  private callbacks: OBSStateCallback[] = [];
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private pollInterval: NodeJS.Timeout | null = null;

  constructor(config: ServerConfig['obs']) {
    this.config = config;
    this.obs = new OBSWebSocket();
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    (this.obs as any).on('ConnectionOpened', () => {
      console.log('[OBS] WebSocket connected');
      this.updateState({ connected: true, reconnecting: false });
      this.reconnectAttempts = 0;
      this.broadcastOBSConnection(true);
    });

    (this.obs as any).on('ConnectionClosed', () => {
      console.log('[OBS] WebSocket disconnected');
      this.updateState({ connected: false, reconnecting: true });
      this.stopPolling();
      this.broadcastOBSConnection(false);
      this.scheduleReconnect();
    });

    (this.obs as any).on('Identified', async () => {
      console.log('[OBS] Authentication successful');
      this.startPolling();
      try {
        const recordState = await this.obs.call('GetRecordStatus');
        console.log('[OBS] Initial record status:', recordState);
        this.updateState({ recording: recordState.outputActive || false });
      } catch (e) {
        console.log('[OBS] Could not get record status:', e);
      }
      try {
        const streamState = await this.obs.call('GetStreamStatus');
        console.log('[OBS] Initial stream status:', streamState);
        this.updateState({ streaming: streamState.outputActive || false });
      } catch (e) {
        console.log('[OBS] Could not get stream status:', e);
      }
      try {
        const sceneResult = await this.obs.call('GetCurrentProgramScene');
        console.log('[OBS] Initial current scene:', sceneResult);
        this.updateState({ currentScene: sceneResult.currentProgramSceneName || null });
      } catch (e) {
        console.log('[OBS] Could not get current scene:', e);
      }
    });

    (this.obs as any).on('CurrentProgramSceneChanged', (data: any) => {
      this.updateState({ currentScene: data.sceneName || null });
    });

    (this.obs as any).on('StreamStateChanged', (data: any) => {
      console.log('[OBS] StreamStateChanged:', data);
      this.updateState({ streaming: data.outputActive });
    });

    (this.obs as any).on('RecordingStateChanged', (data: any) => {
      console.log('[OBS] RecordingStateChanged:', data);
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

  private broadcastOBSConnection(connected: boolean): void {
    this.callbacks.forEach((cb) => cb({ ...this.state, connected }));
  }

  private startPolling(): void {
    if (this.pollInterval) return;
    this.pollInterval = setInterval(async () => {
      if (!this.state.connected) return;
      try {
        const [recordStatus, streamStatus] = await Promise.all([
          this.obs.call('GetRecordStatus'),
          this.obs.call('GetStreamStatus'),
        ]);
        this.updateState({
          recording: recordStatus.outputActive || false,
          streaming: streamStatus.outputActive || false,
        });
      } catch (e) {
        // Ignore polling errors
      }
    }, 2000);
  }

  private stopPolling(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
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

      if (!inputs || inputs.length === 0) {
        throw new Error('No audio inputs found. Configure an Audio Input Capture source in OBS.');
      }

      const micNames = ['mic', 'microphone', 'audio', 'aux', 'sound', 'voice'];
      const excludeNames = ['desktop', 'speakers', 'system', 'wave', 'Stereo', 'playback'];

      let targetInput = inputs.find((i: any) => {
        const name = i.inputName.toLowerCase();
        const isMic = micNames.some(m => name.includes(m));
        const isExcluded = excludeNames.some(e => name.includes(e));
        return isMic && !isExcluded;
      });

      if (!targetInput) {
        targetInput = inputs.find((i: any) => {
          const name = i.inputName.toLowerCase();
          return !excludeNames.some(e => name.includes(e));
        });
      }

      if (!targetInput) {
        targetInput = inputs[0];
      }

      await this.obs.call('ToggleInputMute', { inputName: targetInput.inputName });
    } catch (error) {
      console.error('Failed to toggle mic:', error);
      throw error;
    }
  }

  async toggleRecord(): Promise<void> {
    try {
      console.log('[OBS] toggleRecord called, current state:', this.state.recording);
      console.log('[OBS] Using ToggleRecord...');
      await this.obs.call('ToggleRecord');
      await new Promise(resolve => setTimeout(resolve, 500));
      const status = await this.obs.call('GetRecordStatus');
      console.log('[OBS] Record status after toggle:', status);
      this.updateState({ recording: status.outputActive || false });
    } catch (error) {
      console.error('Failed to toggle record:', error);
      throw error;
    }
  }

  async toggleStream(): Promise<void> {
    try {
      console.log('[OBS] toggleStream called, current state:', this.state.streaming);
      console.log('[OBS] Using ToggleStream...');
      await this.obs.call('ToggleStream');
      await new Promise(resolve => setTimeout(resolve, 500));
      const status = await this.obs.call('GetStreamStatus');
      console.log('[OBS] Stream status after toggle:', status);
      this.updateState({ streaming: status.outputActive || false });
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
