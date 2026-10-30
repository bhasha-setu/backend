// src/websockets/websocket.manager.ts
import { Server as HttpServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { ExtendedWebSocket } from './websocket.types.js';
import { webSocketController } from './websocket.controller.js';
import { APP_CONSTANTS } from '../lib/constants/app.constants.js';
import { WS_AGENT_KEYS, WsAgentKey } from '../lib/constants/websocket.constants.js';
import { Logger } from '../utilities/logger.utility.js';

export class WebSocketManager {
  private static instance: WebSocketManager | null = null;
  private wss: WebSocketServer | null = null;
  private activeConnections: Map<string, ExtendedWebSocket> = new Map();
  private heartbeatInterval: NodeJS.Timeout | null = null;

  private constructor() {}

  public static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager();
    }
    return WebSocketManager.instance;
  }

  /**
   * Initializes the WebSocket Server attached to the shared Node HTTP Server.
   */
  public init(server: HttpServer): void {
    if (this.wss) {
      Logger.warn('WebSocketServer is already initialized');
      return;
    }

    this.wss = new WebSocketServer({
      server,
      path: APP_CONSTANTS.WS_PATH,
    });

    Logger.info(`⚡ WebSocket Server initialized on endpoint: ${APP_CONSTANTS.WS_PATH}`);

    // Connection listener
    this.wss.on('connection', (socket: WebSocket, req) => {
      this.handleConnection(socket, req);
    });

    // Start periodic heartbeat monitor
    this.startHeartbeatMonitor();
  }

  /**
   * Configures new client connection, parses agent parameters, and attaches event listeners.
   */
  private handleConnection(socket: WebSocket, req: any): void {
    const ws = socket as ExtendedWebSocket;

    // Parse URL parameters
    const url = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`);
    const agentParam = url.searchParams.get('agent');
    const userParam = url.searchParams.get('userId');

    ws.connectionId = `ws_conn_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    ws.userId = userParam || APP_CONSTANTS.DEFAULT_USER_ID;
    ws.agentKey = (agentParam === WS_AGENT_KEYS.NANI_BOSS_AGENT
      ? WS_AGENT_KEYS.NANI_BOSS_AGENT
      : WS_AGENT_KEYS.CRICKET_AGENT) as WsAgentKey;
    ws.isAlive = true;
    ws.connectedAt = new Date();

    this.activeConnections.set(ws.connectionId, ws);
    Logger.ws('CONNECT', {
      connectionId: ws.connectionId,
      userId: ws.userId,
      agent: ws.agentKey,
      totalActive: this.activeConnections.size,
    });

    // Explicit named handlers to ensure proper attachment and removal
    const onMessage = (data: Buffer | string) => {
      webSocketController.handleMessage(ws, data);
    };

    const onPong = () => {
      ws.isAlive = true;
    };

    const onError = (error: Error) => {
      Logger.error(`WebSocket error on '${ws.connectionId}':`, error.message);
      this.cleanupConnection(ws, onMessage, onPong, onError, onClose);
    };

    const onClose = (code: number, reason: Buffer) => {
      Logger.ws('DISCONNECT', {
        connectionId: ws.connectionId,
        code,
        reason: reason.toString(),
      });
      this.cleanupConnection(ws, onMessage, onPong, onError, onClose);
    };

    // Attach listeners
    ws.on('message', onMessage);
    ws.on('pong', onPong);
    ws.on('error', onError);
    ws.on('close', onClose);

    // Initial greeting / handshake confirmation
    webSocketController.safeSend(ws, {
      event: 'connected',
      connectionId: ws.connectionId,
      agentKey: ws.agentKey,
      message: `Connected to Bhasha Setu ${ws.agentKey} Voice Drill Engine`,
    });
  }

  /**
   * Safely detaches all event listeners and removes connection from registry.
   */
  private cleanupConnection(
    ws: ExtendedWebSocket,
    onMessage: (data: any) => void,
    onPong: () => void,
    onError: (err: any) => void,
    onClose: (code: number, reason: Buffer) => void
  ): void {
    // 1. Remove event listeners cleanly
    ws.removeListener('message', onMessage);
    ws.removeListener('pong', onPong);
    ws.removeListener('error', onError);
    ws.removeListener('close', onClose);

    // 2. Remove from active connections map
    this.activeConnections.delete(ws.connectionId);

    // 3. Terminate if still open
    if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
      ws.terminate();
    }

    Logger.ws('CLEANUP', {
      connectionId: ws.connectionId,
      remainingActive: this.activeConnections.size,
    });
  }

  /**
   * Periodic ping/pong monitor to detect and prune stale/dead connections.
   */
  private startHeartbeatMonitor(): void {
    this.heartbeatInterval = setInterval(() => {
      for (const [connectionId, ws] of this.activeConnections.entries()) {
        if (!ws.isAlive) {
          Logger.ws('HEARTBEAT_TIMEOUT', { connectionId, terminating: true });
          this.activeConnections.delete(connectionId);
          ws.terminate();
          continue;
        }

        ws.isAlive = false;
        ws.ping();
      }
    }, APP_CONSTANTS.WS_HEARTBEAT_INTERVAL_MS);
  }

  /**
   * Graceful shutdown of all active WebSocket connections and server listeners.
   */
  public async shutdown(): Promise<void> {
    Logger.info('🛑 Shutting down WebSocket Server...');

    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    for (const [connectionId, ws] of this.activeConnections.entries()) {
      ws.terminate();
      this.activeConnections.delete(connectionId);
    }

    if (this.wss) {
      await new Promise<void>((resolve) => {
        this.wss?.close(() => {
          Logger.info('🛑 WebSocket Server closed cleanly');
          resolve();
        });
      });
      this.wss = null;
    }
  }

  public getActiveConnectionCount(): number {
    return this.activeConnections.size;
  }
}

export const webSocketManager = WebSocketManager.getInstance();

