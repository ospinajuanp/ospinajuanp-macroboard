import * as path from 'path';
import { loadConfig, saveConfig } from './server/config';
import { createHTTPServer, stopHTTPServer } from './server/http';
import { WebSocketManager, Client } from './server/websocket';
import { OBSClient, OBSState } from './server/obs';
import { HotkeyManager } from './server/robot';
import { generateQRCode, getConnectionUrl } from './server/qr';
import { WSClientMessage, WSServerMessage, Button } from '@ospinajuanp-macroboard/shared';

const DEFAULT_PORT = 3000;
const SERVER_DIR = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(SERVER_DIR, '..', '..', '..');
const CLIENT_DIST_PATH = path.join(PROJECT_ROOT, 'packages', 'client', 'dist');
const ADMIN_DIST_PATH = path.join(PROJECT_ROOT, 'packages', 'admin', 'out');

const DEFAULT_BUTTONS: Button[] = [
  { id: 'default_record', icon: 'stop', action: 'OBS_RECORD', payload: '', label: 'Rec', color: 'bg-red-600' },
  { id: 'default_stream', icon: 'play', action: 'OBS_STREAM', payload: '', label: 'Stream', color: 'bg-red-600' },
];

class DeckStreamServer {
  private config = loadConfig();
  private wsManager = new WebSocketManager();
  private obsClient: OBSClient | null = null;
  private hotkeyManager = new HotkeyManager();
  private httpServer: Awaited<ReturnType<typeof createHTTPServer>> | null = null;

  async start(): Promise<void> {
    console.log('\n========================================');
    console.log('  ospinajuanp-macroboard');
    console.log('  Controlador Virtual de Macros');
    console.log('========================================\n');

    this.printConfig();

    this.httpServer = await createHTTPServer(DEFAULT_PORT, CLIENT_DIST_PATH, ADMIN_DIST_PATH);

    this.wsManager.start(DEFAULT_PORT + 1, this.handleWSMessage.bind(this));
    this.wsManager.setConnectionHandler(this.handleClientConnect.bind(this));

    this.setupOBSConnection();

    this.printConnectionInfo();

    this.setupGracefulShutdown();
  }

  private printConfig(): void {
    console.log('Configuracion cargada:');
    console.log(`  OBS: ${this.config.obs.host}:${this.config.obs.port}`);
    console.log(`  Botones configurados: ${this.config.buttons.length}`);
    console.log('');
  }

  private printConnectionInfo(): void {
    if (!this.httpServer) return;

    const { ip, port } = this.httpServer;
    const url = getConnectionUrl(ip, port);

    console.log('========================================');
    console.log('  CONEXION');
    console.log('========================================');
    console.log(`  URL para movil: ${url}`);
    console.log('');

    generateQRCode(url).then((qr) => {
      if (qr) {
        console.log('  Codigo QR generado (ver en el log anterior)');
      }
    });

    console.log('  Cliente movil: Escanea el codigo QR');
    console.log('  Admin UI:     http://localhost:3000/admin');
    console.log('========================================\n');
  }

  private setupOBSConnection(): void {
    this.obsClient = new OBSClient(this.config.obs);

    this.obsClient.onStateChange((state: OBSState) => {
      this.wsManager.broadcast({
        type: 'OBS_STATE',
        micMuted: state.micMuted,
        recording: state.recording,
        streaming: state.streaming,
        currentScene: state.currentScene || undefined,
      });
    });

    this.obsClient.connect().catch((error) => {
      console.warn('No se pudo conectar a OBS:', error.message);
      console.warn('El servidor funcionara, pero sin integracion con OBS.');
      this.obsClient = null;
    });
  }

  private async handleWSMessage(client: Client, message: WSClientMessage): Promise<void> {
    console.log(`WS message from ${client.id}:`, message);

    switch (message.type) {
      case 'TRIGGER':
        await this.handleTrigger(client, message);
        break;
      case 'CONFIG_UPDATE':
        this.handleConfigUpdate(message);
        break;
    }
  }

  private handleClientConnect(client: Client): void {
    this.sendConfigToClient(client);
    this.sendOBSStateToClient(client);
  }

  private sendOBSStateToClient(client: Client): void {
    if (this.obsClient) {
      const state = this.obsClient.getState();
      client.ws.send(JSON.stringify({
        type: 'OBS_STATE',
        micMuted: state.micMuted,
        recording: state.recording,
        streaming: state.streaming,
        currentScene: state.currentScene || undefined,
      }));
    }
  }

  private sendConfigToClient(client: Client): void {
    const buttons = client.clientType === 'mobile'
      ? [...DEFAULT_BUTTONS, ...this.config.buttons]
      : this.config.buttons;
    client.ws.send(JSON.stringify({
      type: 'CONFIG_UPDATE',
      buttons,
    }));
  }

  private async handleTrigger(client: Client, message: WSClientMessage): Promise<void> {
    const { buttonId, action, payload } = message;

    if (!buttonId || !action) {
      client.ws.send(JSON.stringify({ type: 'ACTION_ACK', buttonId, success: false }));
      return;
    }

    try {
      switch (action) {
        case 'OBS_SCENE':
          if (this.obsClient) {
            await this.obsClient.setScene(payload || '');
          }
          break;
        case 'OBS_MUTE':
          if (this.obsClient && this.obsClient.isConnected()) {
            await this.obsClient.toggleMic();
          } else {
            throw new Error('OBS no conectado');
          }
          break;
        case 'OBS_RECORD':
          if (this.obsClient && this.obsClient.isConnected()) {
            await this.obsClient.toggleRecord();
          } else {
            throw new Error('OBS no conectado');
          }
          break;
        case 'OBS_STREAM':
          if (this.obsClient && this.obsClient.isConnected()) {
            await this.obsClient.toggleStream();
          } else {
            throw new Error('OBS no conectado');
          }
          break;
        case 'HOTKEY':
          await this.hotkeyManager.pressHotkey(payload?.split('+').map((k) => k.trim()) || []);
          break;
        case 'MACRO':
          await this.executeMacro(payload || '');
          break;
      }

      client.ws.send(JSON.stringify({ type: 'ACTION_ACK', buttonId, success: true }));
    } catch (error) {
      console.error(`Action failed for ${buttonId}:`, error);
      client.ws.send(JSON.stringify({ type: 'ACTION_ACK', buttonId, success: false }));
    }
  }

  private async executeMacro(macroName: string): Promise<void> {
    console.log(`Executing macro: ${macroName}`);
  }

  private handleConfigUpdate(message: WSClientMessage): void {
    if (message.buttons) {
      this.config.buttons = message.buttons;
    }
    saveConfig(this.config);
    this.wsManager.broadcast({ type: 'CONFIG_UPDATE', buttons: this.config.buttons });
  }

  private setupGracefulShutdown(): void {
    const shutdown = async () => {
      console.log('\nApagando servidor...');
      this.wsManager.stop();
      if (this.httpServer) {
        await stopHTTPServer(this.httpServer);
      }
      if (this.obsClient) {
        await this.obsClient.disconnect();
      }
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  }
}

const server = new DeckStreamServer();
server.start().catch((error) => {
  console.error('Error iniciando servidor:', error);
  process.exit(1);
});
