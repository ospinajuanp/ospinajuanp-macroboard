import Fastify, { FastifyInstance } from 'fastify';
import { WSServerMessage } from '@ospinajuanp-macroboard/shared';
import { OBSClient } from './server/obs';
import { HotkeyManager } from './server/robot';
import { getLocalIP } from './server/network';
import { generateQRCode, getConnectionUrl } from './server/qr';
import { apiRoutes } from './routes/api.routes';
import { staticRoutes } from './routes/static.routes';
import { ButtonService } from './services/button.service';
import { ConfigService } from './services/config.service';
import { WebSocketManager } from './ws/manager';
import { buildOBSStateMessage } from './ws/handlers';
import { createLogger } from './lib/logger';

const log = createLogger('app');

export interface AppOptions {
  httpPort: number;
  clientDistPath: string;
  adminDistPath: string;
  configPath: string;
  autoOpenAdmin?: boolean;
}

export interface AppContext {
  app: FastifyInstance;
  wsManager: WebSocketManager;
  obsClient: OBSClient;
  hotkeyManager: HotkeyManager;
  configService: ConfigService;
  buttonService: ButtonService;
  start(): Promise<void>;
  shutdown(): Promise<void>;
}

export async function createApp(options: AppOptions): Promise<AppContext> {
  const fastify = Fastify({ logger: false });

  const ip = getLocalIP();

  await fastify.register(apiRoutes, { ip, port: options.httpPort });
  await fastify.register(staticRoutes, {
    clientDistPath: options.clientDistPath,
    adminDistPath: options.adminDistPath,
  });

  const configService = new ConfigService({ configPath: options.configPath });
  const obsClient = new OBSClient(configService.load().obs);
  const hotkeyManager = new HotkeyManager();
  const buttonService = new ButtonService({ obs: obsClient, hotkeys: hotkeyManager });

  const wsManager = new WebSocketManager();
  wsManager.setDeps({
    buttons: buttonService,
    config: configService,
    obs: obsClient,
    broadcast: (msg: WSServerMessage) => wsManager.broadcast(msg),
  });

  obsClient.onStateChange((state) => {
    wsManager.broadcast({
      ...buildOBSStateMessage(state),
      obsConnected: state.connected,
      obsReconnecting: state.reconnecting,
    });
    if (state.connected) {
      log.info('OBS connected');
    } else if (state.reconnecting) {
      log.info('OBS reconnecting');
    } else {
      log.info('OBS disconnected');
    }
  });

  let isShuttingDown = false;

  async function start(): Promise<void> {
    log.info('Starting HTTP server', { port: options.httpPort });

    await fastify.listen({ port: options.httpPort, host: '0.0.0.0' });
    log.info('HTTP server listening', { url: `http://${ip}:${options.httpPort}` });

    wsManager.start(options.httpPort + 1);
    log.info('WebSocket server listening', { port: options.httpPort + 1 });

    printConnectionInfo(options, ip);

    obsClient.connect().catch((err) => {
      log.warn('Initial OBS connection failed', { error: err.message });
      log.info('Will retry automatically');
    });
  }

  async function shutdown(): Promise<void> {
    if (isShuttingDown) return;
    isShuttingDown = true;
    log.info('Shutting down...');

    wsManager.stop();
    await fastify.close();
    await obsClient.disconnect().catch((err) => log.warn('OBS disconnect error', { error: err.message }));
  }

  return {
    app: fastify,
    wsManager,
    obsClient,
    hotkeyManager,
    configService,
    buttonService,
    start,
    shutdown,
  };
}

async function printConnectionInfo(options: AppOptions, ip: string): Promise<void> {
  const mobileUrl = getConnectionUrl(ip, options.httpPort, '/m');
  const adminUrl = `http://localhost:${options.httpPort}/admin`;

  log.info('========================================');
  log.info('CONEXION');
  log.info('========================================');
  log.info('Mobile URL', { url: mobileUrl });

  const qr = await generateQRCode(mobileUrl).catch(() => '');
  if (qr) {
    log.info('QR code generated (see /api/status)');
  }

  log.info('Mobile client: scan the QR');
  log.info('Admin UI', { url: adminUrl });

  const config = new ConfigService({ configPath: options.configPath }).load();
  if (config.autoOpen !== false && options.autoOpenAdmin !== false) {
    setTimeout(() => {
      const { exec } = require('child_process') as typeof import('child_process');
      exec(`start "" "${adminUrl}"`, (err) => {
        if (err) log.warn('Auto-open failed', { error: err.message });
      });
    }, 1000);
  }
}