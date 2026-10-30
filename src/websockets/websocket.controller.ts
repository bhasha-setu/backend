// src/websockets/websocket.controller.ts
import { ExtendedWebSocket, WsClientIncomingMessage } from './websocket.types.js';
import { webSocketService } from './websocket.service.js';
import { WS_CLIENT_EVENTS, WS_SERVER_EVENTS } from '../lib/constants/websocket.constants.js';
import { Logger } from '../utilities/logger.utility.js';

export class WebSocketController {
  /**
   * Main incoming frame router for active client WebSocket connections.
   */
  public async handleMessage(ws: ExtendedWebSocket, rawData: string | Buffer): Promise<void> {
    try {
      const text = rawData.toString();
      const payload = JSON.parse(text) as WsClientIncomingMessage;

      // 1. Microphone audio chunk streaming
      if ('event' in payload && payload.event === WS_CLIENT_EVENTS.USER_AUDIO) {
        const response = await webSocketService.handleUserAudio(
          ws,
          payload.data,
          payload.db ?? 85.0
        );
        this.safeSend(ws, response);
        return;
      }

      // 2. Silent mode typed fallback text turn
      if ('event' in payload && payload.event === WS_CLIENT_EVENTS.USER_TEXT) {
        const response = await webSocketService.handleUserText(ws, payload.text);
        this.safeSend(ws, response);
        return;
      }

      // 3. Binary or streaming audio frame (e.g. Cricket Roar Meter)
      if ('action' in payload && payload.action === WS_CLIENT_EVENTS.AUDIO_FRAME) {
        const decibels = payload.db ?? 92.0;
        const response = webSocketService.handleAudioFrame(decibels);
        this.safeSend(ws, response);
        return;
      }

      // 4. Ping keepalive frame
      if ('event' in payload && payload.event === WS_CLIENT_EVENTS.PING) {
        this.safeSend(ws, { event: WS_SERVER_EVENTS.PONG });
        return;
      }

      Logger.warn(`Unrecognized WebSocket event from connection '${ws.connectionId}':`, text);
    } catch {
      // Safely ignore malformed non-JSON frames (matches frontend server_services.ts behavior)
    }
  }

  /**
   * Safely sends JSON string frame across active WebSocket.
   */
  public safeSend(ws: ExtendedWebSocket, payload: Record<string, any>): void {
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify(payload));
    }
  }
}

export const webSocketController = new WebSocketController();

