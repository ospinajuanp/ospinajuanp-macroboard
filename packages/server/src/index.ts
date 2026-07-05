import * as path from 'path';
import * as fs from 'fs';
import { exec, spawn } from 'child_process';
import { loadConfig, saveConfig } from './server/config';
import { isPackaged, getBasePath, getStaticPath } from './server/paths';
import { createHTTPServer, stopHTTPServer } from './server/http';
import { WebSocketManager, Client } from './server/websocket';
import { OBSClient, OBSState } from './server/obs';
import { HotkeyManager } from './server/robot';
import { generateQRCode, getConnectionUrl } from './server/qr';
import { WSClientMessage, WSServerMessage, Button } from '@ospinajuanp-macroboard/shared';

const DEFAULT_PORT = 3000;

function getStaticPaths() {
  const isPkg = isPackaged();

  if (isPkg) {
    const basePath = getBasePath();
    return {
      clientDistPath: path.join(basePath, 'static', 'client'),
      adminDistPath: path.join(basePath, 'static', 'admin'),
      basePath,
    };
  }
  const serverDir = path.dirname(__filename);
  const projectRoot = path.resolve(serverDir, '..', '..', '..');
  return {
    clientDistPath: path.join(projectRoot, 'packages', 'client', 'dist'),
    adminDistPath: path.join(projectRoot, 'packages', 'admin', 'out'),
    basePath: process.cwd(),
  };
}

const { clientDistPath: CLIENT_DIST_PATH, adminDistPath: ADMIN_DIST_PATH, basePath: BASE_PATH } = getStaticPaths();

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
  private trayProcess: ReturnType<typeof spawn> | null = null;
  private quitCheckInterval: NodeJS.Timeout | null = null;
  private isShuttingDown = false;

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

    this.setupSystemTray();

    this.setupGracefulShutdown();
  }

  private setupSystemTray(): void {
    // TEMPORARILY DISABLED - System tray requires C# compilation which has issues
    // TODO: Re-enable once TrayHelper compilation is more reliable
    console.log('[System Tray] DISABLED - See README for details');
  }

  private async shutdown(): Promise<void> {
    if (this.isShuttingDown) return;
    this.isShuttingDown = true;

    console.log('\nApagando servidor...');

    if (this.quitCheckInterval) {
      clearInterval(this.quitCheckInterval);
    }

    this.wsManager.stop();
    if (this.httpServer) {
      await stopHTTPServer(this.httpServer);
    }
    if (this.obsClient) {
      await this.obsClient.disconnect();
    }
    if (this.trayProcess) {
      try {
        this.trayProcess.kill();
      } catch {}
    }
    process.exit(0);
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
    const mobileUrl = getConnectionUrl(ip, port, '/m');
    const adminUrl = `http://localhost:${port}/admin`;

    console.log('========================================');
    console.log('  CONEXION');
    console.log('========================================');
    console.log(`  URL para movil: ${mobileUrl}`);
    console.log('');

    generateQRCode(mobileUrl).then((qr) => {
      if (qr) {
        console.log('  Codigo QR generado (ver en el log anterior)');
      }
    });

    console.log('  Cliente movil: Escanea el codigo QR');
    console.log('  Admin UI:     http://localhost:3000/admin');
    console.log('========================================\n');

    if (this.config.autoOpen !== false) {
      setTimeout(() => {
        exec(`start "" "${adminUrl}"`, (err) => {
          if (err) {
            console.warn('Auto-open failed:', err.message);
          }
        });
      }, 1000);
    }
  }

  private setupOBSConnection(): void {
    this.obsClient = new OBSClient(this.config.obs);

    this.obsClient.onStateChange((state: OBSState) => {
      this.wsManager.broadcast({
        type: 'OBS_STATE',
        obsConnected: state.connected,
        obsReconnecting: state.reconnecting,
        micMuted: state.micMuted,
        recording: state.recording,
        streaming: state.streaming,
        currentScene: state.currentScene || undefined,
      });
    });

    this.obsClient.connect().catch((error) => {
      console.warn('Could not connect to OBS:', error.message);
      console.warn('Server will continue without OBS integration.');
      this.obsClient = null;
    });
  }

  private async handleWSMessage(client: Client, message: WSClientMessage): Promise<void> {
    switch (message.type) {
      case 'TRIGGER':
        await this.handleTrigger(client, message);
        break;
      case 'CONFIG_UPDATE':
        this.handleConfigUpdate(message);
        break;
      case 'GET_SCENES':
        await this.handleGetScenes(client);
        break;
    }
  }

  private async handleGetScenes(client: Client): Promise<void> {
    if (!this.obsClient) {
      client.ws.send(JSON.stringify({ type: 'OBS_SCENES', scenes: [] }));
      return;
    }

    try {
      const result = await this.obsClient.getScenes();
      client.ws.send(JSON.stringify({ type: 'OBS_SCENES', scenes: result }));
    } catch {
      client.ws.send(JSON.stringify({ type: 'OBS_SCENES', scenes: [] }));
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
    client.ws.send(JSON.stringify({
      type: 'CONFIG_UPDATE',
      buttons: [...DEFAULT_BUTTONS, ...this.config.buttons],
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
            throw new Error('OBS not connected');
          }
          break;
        case 'OBS_RECORD':
          if (this.obsClient && this.obsClient.isConnected()) {
            await this.obsClient.toggleRecord();
          } else {
            throw new Error('OBS not connected');
          }
          break;
        case 'OBS_STREAM':
          if (this.obsClient && this.obsClient.isConnected()) {
            await this.obsClient.toggleStream();
          } else {
            throw new Error('OBS not connected');
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
    } catch {
      client.ws.send(JSON.stringify({ type: 'ACTION_ACK', buttonId, success: false }));
    }
  }

  private async executeMacro(_macroName: string): Promise<void> {
    // macro execution placeholder
  }

  private handleConfigUpdate(message: WSClientMessage): void {
    if (message.buttons) {
      this.config.buttons = message.buttons;
    }
    saveConfig(this.config);
    this.wsManager.broadcast({ type: 'CONFIG_UPDATE', buttons: [...DEFAULT_BUTTONS, ...this.config.buttons] });
  }

  private setupGracefulShutdown(): void {
    process.on('SIGINT', () => this.shutdown());
    process.on('SIGTERM', () => this.shutdown());
  }
}

const server = new DeckStreamServer();
server.start().catch((error) => {
  console.error('Error iniciando servidor:', error);
  process.exit(1);
});
