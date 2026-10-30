// src/lib/constants/websocket.constants.ts

export const WS_CLIENT_EVENTS = {
  USER_AUDIO: 'user_audio',
  USER_TEXT: 'user_text',
  AUDIO_FRAME: 'audio_frame',
  PING: 'ping',
} as const;

export type WsClientEvent = typeof WS_CLIENT_EVENTS[keyof typeof WS_CLIENT_EVENTS];

export const WS_SERVER_EVENTS = {
  ASR_PARTIAL: 'asr_partial',
  AI_VOICE_NOTE: 'ai_voice_note',
  EVALUATED: 'evaluated',
  PONG: 'pong',
  ERROR: 'error',
} as const;

export type WsServerEvent = typeof WS_SERVER_EVENTS[keyof typeof WS_SERVER_EVENTS];

export const WS_AGENT_KEYS = {
  CRICKET_AGENT: 'CRICKET_AGENT',
  NANI_BOSS_AGENT: 'NANI_BOSS_AGENT',
} as const;

export type WsAgentKey = typeof WS_AGENT_KEYS[keyof typeof WS_AGENT_KEYS];

