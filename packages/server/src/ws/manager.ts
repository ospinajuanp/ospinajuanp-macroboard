import { WebSocketServer, WebSocket } from 'ws';
import { WSServerMessage } from '@ospinajuanp-macroboard/shared';
import { WSClientMessageSchema, WSClientMessageValidated } from './schemas';
import {
  HandlerDeps,
  WSClient,
  buildConfigUpdateMessage,
  buildOBSStateMessage,
  handleConfigUpdate,
  handleGetScenes,
  handleTrigger,
  send,
} from './handlers';
import { createLogger, Logger } from '../lib/logger';

const log = createLogger('ws-manager');

export class WebSocketManager {
  private wss: WebSocketServer | null = null;
  private readonly clients = new Map<string, WSClient>();
  private deps: HandlerDeps | null = null;
  private readonly logger: Logger;

  constructor(deps?: HandlerDeps, logger: Logger = log) {
    if (deps) this.deps = deps;
    this.logger = logger;
  }

  setDeps(deps: HandlerDeps): void {
    this.deps = deps;
  }

  start(port: number): void {
    if (this.wss) {
      this.logger.warn('WebSocketServer already started');
      return;
    }

    this.wss = new WebSocketServer({ port });

    this.wss.on('connection', (ws: WebSocket) => {
      const client = this.registerClient(ws);
      this.logger.info('Client connected', { id: client.id });

      this.welcome(client);

      ws.on('message', (data: Buffer) => {
        this.handleMessage(client, data).catch((err) => {
          this.logger.error('Unexpected error in message handler', {
            id: client.id,
            error: err instanceof Error ? err.message : String(err),
          });
        });
      });

      ws.on('close', () => {
        client.connected = false;
        this.clients.delete(client.id);
        this.logger.info('Client disconnected', { id: client.id });
      });

      ws.on('error', (error) => {
        this.logger.warn('Client error', {
          id: client.id,
          error: error.message,
        });
      });
    });

    this.wss.on('error', (error) => {
      this.logger.error('WebSocketServer error', { error: error.message });
    });
  }

  private registerClient(ws: WebSocket): WSClient {
    const id = `client_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    const client: WSClient = { id, ws, connected: true };
    this.clients.set(id, client);
    return client;
  }

  private welcome(client: WSClient): void {
    if (!this.deps) return;
    const config = this.deps.config.load();
    send(client, buildConfigUpdateMessage(config.buttons));
    const state = this.deps.obs.getState();
    send(client, buildOBSStateMessage(state));
  }

  private async handleMessage(client: WSClient, data: Buffer): Promise<void> {
    let parsed: unknown;
    try {
      parsed = JSON.parse(data.toString());
    } catch {
      this.logger.warn('Invalid JSON from client', { id: client.id });
      client.ws.close(1008, 'Malformed JSON');
      return;
    }

    const result = WSClientMessageSchema.safeParse(parsed);
    if (!result.success) {
      this.logger.warn('Validation failed for WS message', {
        id: client.id,
        issues: result.error.issues,
      });
      client.ws.close(1008, 'Invalid message');
      return;
    }

    if (!this.deps) {
      this.logger.error('No deps configured for WebSocketManager');
      return;
    }

    const message: WSClientMessageValidated = result.data;

    switch (message.type) {
      case 'CLIENT_TYPE':
        client.clientType = message.clientType;
        this.welcome(client);
        return;

      case 'TRIGGER':
        await handleTrigger(client, message, this.deps);
        return;

      case 'CONFIG_UPDATE':
        handleConfigUpdate(message, this.deps);
        return;

      case 'GET_SCENES':
        await handleGetScenes(client, message, this.deps);
        return;

      default: {
        const exhaustive: never = message;
        throw new Error(`Unhandled message type: ${String(exhaustive)}`);
      }
    }
  }

  broadcast(message: WSServerMessage): void {
    const data = JSON.stringify(message);
    for (const client of this.clients.values()) {
      if (client.connected && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(data);
      }
    }
  }

  sendToClient(clientId: string, message: WSServerMessage): void {
    const client = this.clients.get(clientId);
    if (client) send(client, message);
  }

  getConnectedClients(): number {
    return this.clients.size;
  }

  stop(): void {
    for (const client of this.clients.values()) {
      client.ws.close();
    }
    this.clients.clear();
    if (this.wss) {
      this.wss.close();
      this.wss = null;
    }
  }
}