// src/lib/constants/app.constants.ts

export const APP_CONSTANTS = {
  DEFAULT_USER_ID: process.env.DEFAULT_USER_ID || 'usr_zen_pioneer_01',
  DEFAULT_PORT: Number(process.env.PORT) || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  WS_PATH: process.env.WS_PATH || '/ws/drill',
  WS_HEARTBEAT_INTERVAL_MS: Number(process.env.WS_HEARTBEAT_INTERVAL_MS) || 30000,
  GOLDEN_DIYA_FLUENCY_THRESHOLD: Number(process.env.GOLDEN_DIYA_FLUENCY_THRESHOLD) || 85,
  COMBO_MULTIPLIER: Number(process.env.COMBO_MULTIPLIER) || 2,
  API_PREFIX: '/api',
  AI_AGENT_URL: process.env.AI_AGENT_URL || 'http://localhost:8000',
  AI_AGENT_TIMEOUT_MS: 800,
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;

