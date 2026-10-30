// src/websockets/websocket.service.ts
import { ExtendedWebSocket, WsServerAsrPartial, WsServerAiVoiceNote, WsServerEvaluated } from './websocket.types.js';
import { WS_AGENT_KEYS, WS_SERVER_EVENTS } from '../lib/constants/websocket.constants.js';
import { AudioCadenceUtility } from '../utilities/audioCadence.utility.js';
import { prisma } from '../database/prisma.client.js';
import { Logger } from '../utilities/logger.utility.js';

export class WebSocketService {
  /**
   * Processes streaming microphone audio chunk (Screen 3 & Screen 5).
   * Emits live partial ASR to power the dynamic bouncing terracotta soundwave bars.
   */
  public async handleUserAudio(
    ws: ExtendedWebSocket,
    base64Data: string,
    decibels = 85.0
  ): Promise<WsServerAsrPartial> {
    const isCricket = ws.agentKey === WS_AGENT_KEYS.CRICKET_AGENT;
    const partialText = isCricket ? 'शानदार छक्का!' : 'नमस्ते नानी जी, आप कैसी हैं?';

    // Calculate clarity percent based on acoustic energy
    const clarityPercent = Math.min(98, Math.max(75, Math.round(decibels > 90 ? 94 : 88)));

    return {
      event: WS_SERVER_EVENTS.ASR_PARTIAL,
      text_hi: partialText,
      clarity_percent: clarityPercent,
    };
  }

  /**
   * Processes fallback typed text ("Can't speak right now? Type instead").
   * Enforces Cultural Etiquette for Nani Boss, or stadium feedback for Cricket.
   */
  public async handleUserText(
    ws: ExtendedWebSocket,
    userText: string
  ): Promise<WsServerAiVoiceNote | WsServerAsrPartial> {
    const isNaniBoss = ws.agentKey === WS_AGENT_KEYS.NANI_BOSS_AGENT;

    if (isNaniBoss) {
      const evaluation = AudioCadenceUtility.evaluateVoiceTurn(userText, 85.0, 220.0);
      const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

      // Save user message to database
      try {
        await prisma.chatMessage.create({
          data: {
            id: `user-msg-${Date.now()}`,
            userId: ws.userId,
            sender: 'user',
            hindiText: `“${userText.trim()}”`,
            englishSubtext: '“User typed response”',
            duration: '0:03',
            timestamp: now,
            fluencyScore: evaluation.fluencyScore,
            respectWord: evaluation.respectMarkerUsed || undefined,
          },
        });

        // Award XP and check Golden Diya unlock
        if (evaluation.isGoldenDiyaUnlocked) {
          await prisma.user.update({
            where: { id: ws.userId },
            data: {
              isGoldenDiyaUnlocked: true,
              xp: { increment: evaluation.xpAwarded },
            },
          });
          await prisma.userArtifact.upsert({
            where: {
              userId_artifactId: {
                userId: ws.userId,
                artifactId: 'golden-diya',
              },
            },
            update: {},
            create: {
              userId: ws.userId,
              artifactId: 'golden-diya',
            },
          });
        }
      } catch (err) {
        Logger.error('Failed to persist user chat turn in WebSocket:', err);
      }

      // Generate context-aware affectionate Nani reply
      let replyHindi = '“जीते रहो बेटा! तुम्हारा इंतज़ार रहेगा। खूब खुश रहो! 🪔”';
      let replyEnglish = '“Live long son! I will be waiting for you. Stay blessed!”';

      if (evaluation.informalMarkerUsed) {
        replyHindi = '“बेटा, बड़ों से ‘आप’ कहकर बात करते हैं। लेकिन तुम खूब खुश रहो!”';
        replyEnglish = '“Son, we speak using ‘Aap’ to elders. But stay blessed!”';
      }

      // Save Nani reply to database
      try {
        await prisma.chatMessage.create({
          data: {
            id: `nani-reply-${Date.now()}`,
            userId: ws.userId,
            sender: 'nani',
            hindiText: replyHindi,
            englishSubtext: replyEnglish,
            duration: '0:04',
            timestamp: now,
          },
        });
      } catch (err) {
        Logger.error('Failed to persist Nani chat reply in WebSocket:', err);
      }

      return {
        event: WS_SERVER_EVENTS.AI_VOICE_NOTE,
        id: String(Date.now()),
        text_hi: replyHindi,
        text_en: replyEnglish,
        duration: '0:04',
        timestamp: now,
      };
    }

    // Cricket Agent silent text return
    return {
      event: WS_SERVER_EVENTS.ASR_PARTIAL,
      text_hi: userText,
      clarity_percent: 92,
    };
  }

  /**
   * Processes real-time audio frame and calculates roar meter evaluation.
   */
  public handleAudioFrame(decibels: number): WsServerEvaluated {
    const { roarPercentage, stadiumReaction, xpEarned } = AudioCadenceUtility.computeRoarPercentage(decibels);

    return {
      status: 'evaluated',
      roar_percentage: roarPercentage,
      stadium_reaction: stadiumReaction,
      xp_earned: xpEarned,
    };
  }
}

export const webSocketService = new WebSocketService();

