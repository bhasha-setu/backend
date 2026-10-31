// src/agent/agent.service.ts
import { APP_CONSTANTS } from '../lib/constants/app.constants.js';
import { Logger } from '../utilities/logger.utility.js';

export class AgentService {
  private static baseUrl = APP_CONSTANTS.AI_AGENT_URL;
  private static defaultTimeoutMs = APP_CONSTANTS.AI_AGENT_TIMEOUT_MS;

  /**
   * Proxies a request to the FastAPI AI microservice with a strict 800ms timeout.
   * If FastAPI takes >800ms or fails, gracefully executes fallbackFn so the live demo never freezes.
   */
  public static async callWithFallback<T>(
    endpoint: string,
    body: any,
    fallbackFn: () => T | Promise<T>,
    timeoutMs = AgentService.defaultTimeoutMs
  ): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const url = `${AgentService.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`FastAPI responded with HTTP ${response.status}`);
      }

      const data = await response.json();
      return data as T;
    } catch (err: any) {
      const isTimeout = err.name === 'AbortError';
      Logger.warn(
        `[AgentProxy] ${endpoint} ${isTimeout ? `timed out after ${timeoutMs}ms` : `error: ${err.message}`}. Engaging zero-freeze local fallback.`
      );
      return await fallbackFn();
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Direct fetch from FastAPI (used by proxy endpoints) with timeout and error wrapping.
   */
  public static async proxyGet(endpoint: string, timeoutMs = AgentService.defaultTimeoutMs) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(`${AgentService.baseUrl}${endpoint}`, { signal: controller.signal });
      return await res.json();
    } finally {
      clearTimeout(timeout);
    }
  }
}

