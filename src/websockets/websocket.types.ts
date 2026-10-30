// src/websockets/websocket.types.ts
import { WebSocket } from 'ws';
import { WsAgentKey } from '../lib/constants/websocket.constants.js';

export interface ExtendedWebSocket extends WebSocket {
  connectionId: string;
  userId: string;
  agentKey: WsAgentKey;
  isAlive: boolean;
  connectedAt: Date;
}

export interface WsClientAudioPayload {
  event: 'user_audio';
  data: string; // base64 PCM chunk
  db?: number;
}

export interface WsClientTextPayload {
  event: 'user_text';
  text: string;
}

export interface WsClientFramePayload {
  action: 'audio_frame';
  sequence?: number;
  data_base64?: string;
  db?: number;
}

export interface WsClientPingPayload {
  event: 'ping';
}

export type WsClientIncomingMessage =
  | WsClientAudioPayload
  | WsClientTextPayload
  | WsClientFramePayload
  | WsClientPingPayload;

export interface WsServerAsrPartial {
  event: 'asr_partial';
  text_hi: string;
  clarity_percent: number;
}

export interface WsServerAiVoiceNote {
  event: 'ai_voice_note';
  id?: string;
  text_hi: string;
  text_en: string;
  duration: string;
  timestamp: string;
}

export interface WsServerEvaluated {
  status: 'evaluated';
  roar_percentage: number;
  stadium_reaction: string;
  xp_earned: number;
}

