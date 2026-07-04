import { WebSocketServer, WebSocket } from 'ws';
import { ServerConfig, WSClientMessage, WSServerMessage } from '@ospinajuanp-macroboard/shared';

export interface Client {
  id: string;
  ws: WebSocket;
  connected: boolean;
}

export type MessageHandler = (client: Client, message: WSClientMessage) => void;
export type ConnectionHandler = (client: Client) => void;
export type StateChangeHandler = (state: WSServerMessage) => void;

export class WebSocketManager {
  private wss: WebSocketServer | null = null;
  private clients: Map<string, Client> = new Map();
  private messageHandler: MessageHandler | null = null;
  private connectionHandler: ConnectionHandler | null = null;
  private stateChangeHandler: StateChangeHandler | null = null;

  start(port: number, onMessage: MessageHandler): void {
    this.messageHandler = onMessage;

    this.wss = new WebSocketServer({ port });

    this.wss.on('connection', (ws: WebSocket) => {
      const clientId = this.generateClientId();
      const client: Client = { id: clientId, ws, connected: true };
      this.clients.set(clientId, client);

      console.log(`Client connected: ${clientId}`);

      if (this.connectionHandler) {
        this.connectionHandler(client);
      }

      ws.on('message', (data: Buffer) => {
        try {
          const message = JSON.parse(data.toString()) as WSClientMessage;
          if (this.messageHandler) {
            this.messageHandler(client, message);
          }
        } catch (error) {
          console.error('Failed to parse message:', error);
        }
      });

      ws.on('close', () => {
        console.log(`Client disconnected: ${clientId}`);
        this.clients.delete(clientId);
      });

      ws.on('error', (error) => {
        console.error(`Client error (${clientId}):`, error);
      });
    });

    this.wss.on('error', (error) => {
      console.error('WebSocket server error:', error);
    });
  }

  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  broadcast(message: WSServerMessage): void {
    const data = JSON.stringify(message);
    this.clients.forEach((client) => {
      if (client.connected && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(data);
      }
    });
  }

  sendToClient(clientId: string, message: WSServerMessage): void {
    const client = this.clients.get(clientId);
    if (client && client.connected && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(message));
    }
  }

  setConnectionHandler(handler: ConnectionHandler): void {
    this.connectionHandler = handler;
  }

  setStateChangeHandler(handler: StateChangeHandler): void {
    this.stateChangeHandler = handler;
  }

  broadcastStateUpdate(state: Partial<WSServerMessage>): void {
    if (this.stateChangeHandler) {
      this.stateChangeHandler(state as WSServerMessage);
    }
    this.broadcast(state as WSServerMessage);
  }

  getConnectedClients(): number {
    return this.clients.size;
  }

  stop(): void {
    this.clients.forEach((client) => {
      client.ws.close();
    });
    this.clients.clear();
    if (this.wss) {
      this.wss.close();
      this.wss = null;
    }
  }
}
