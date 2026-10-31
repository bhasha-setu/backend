// src/agent/agent.routes.ts
import { Router } from 'express';
import { AgentService } from './agent.service.js';
import { ResponseUtility } from '../utilities/response.utility.js';
import { DevanagariUtility } from '../utilities/devanagari.utility.js';

const agentRouter = Router();

// Health check for AI agent proxy
agentRouter.get('/health', async (_req, res) => {
  try {
    const data = await AgentService.proxyGet('/health', 800);
    ResponseUtility.success(res, data, 'FastAPI AI Agent is healthy');
  } catch (err: any) {
    ResponseUtility.success(res, { status: 'fallback', message: 'Local fallback active' }, 'AI Agent in fallback mode');
  }
});

// Evaluate Devanagari answer with 800ms fallback
agentRouter.post('/evaluate', async (req, res) => {
  const { drill_type, user_text, expected_text, attempt_count, user_id } = req.body;

  const result = await AgentService.callWithFallback(
    '/api/agent/evaluate',
    req.body,
    () => {
      // Local fallback calculation
      const exp = expected_text || (drill_type?.includes('BOLLYWOOD') ? 'दिल' : 'तीखा');
      const isMatch = DevanagariUtility.isExactMatch(user_text, exp);
      return {
        is_correct: isMatch,
        score: isMatch ? 100 : 0,
        akshara_distance: isMatch ? 0 : 1,
        normalized_user_text: user_text?.trim() || '',
        feedback_hindi: isMatch ? `शानदार! बिल्कुल सही उत्तर: '${exp}'।` : `करीब हैं! दोबारा प्रयास करें।`,
        feedback_english: isMatch ? 'Splendid! Exact active recall match.' : 'Keep going!',
        xp_awarded: isMatch ? 30 : 0,
      };
    },
    800
  );

  ResponseUtility.success(res, result);
});

// Curated Song Tutor
agentRouter.post('/song-tutor', async (req, res) => {
  const { target_word } = req.body;
  const result = await AgentService.callWithFallback(
    '/api/agent/song-tutor',
    req.body,
    () => ({
      song_id: 'kabhi_kabhie_dil',
      target_word: target_word || 'दिल',
      akshara_count: 2,
      song_title: 'Kabhi Kabhie Mere Dil Mein (1976)',
      film: 'Kabhi Kabhie',
      singers: ['Mukesh', 'Lata Mangeshkar'],
      lyricist: 'Sahir Ludhianvi',
      canonical_line: 'कभी कभी मेरे दिल में ख़याल आता है',
      blanked_line: 'कभी कभी मेरे [ ____ ] में ख़याल आता है',
      translation: 'Sometimes, in my heart, a thought arises',
      phonetic_rhyme_hint: "Rhymes with English 'bill'; starts with 'द' (da)",
      cultural_etymology: "In Hindustani poetry, 'दिल' denotes the seat of conscience and intuition.",
      xp_reward: 20,
    }),
    800
  );

  ResponseUtility.success(res, result);
});

// Nani WhatsApp Boss Turn & Register Scorer
agentRouter.post('/tutor/turn', async (req, res) => {
  const { user_text } = req.body;
  const result = await AgentService.callWithFallback(
    '/api/agent/tutor/turn',
    req.body,
    () => {
      const isRespectful = user_text?.includes('आप') && user_text?.includes('हैं');
      return {
        status: isRespectful ? 'RESPECTFUL_PERFECT' : 'NEUTRAL',
        score: isRespectful ? 1.0 : 0.6,
        register_feedback: isRespectful
          ? 'उत्कृष्ट! शिष्ट और मानक आदरार्थक भाषा।'
          : 'सटीक प्रयास! बड़ों के संवाद में आप और जी का प्रयोग करें।',
        nani_reply_hindi: isRespectful
          ? 'जीते रहो बेटा! खूब खुश रहो। तुम्हारी पसंद के बेसन के लड्डू तैयार हैं! 🪔'
          : 'जीते रहो बेटा! घर कब आ रहे हो?',
        nani_reply_english: isRespectful
          ? 'Live long my child! Stay blessed. Your favorite besan laddus are ready!'
          : 'Stay blessed child! When are you coming home?',
        xp_awarded: isRespectful ? 50 : 20,
        unlock_golden_diya: isRespectful,
      };
    },
    800
  );

  ResponseUtility.success(res, result);
});

// Autonomous Learner Model: Next Goal
agentRouter.post('/learner/next-goal', async (req, res) => {
  const result = await AgentService.callWithFallback(
    '/api/agent/learner/next-goal',
    req.body,
    () => ({
      user_id: req.body?.user_id || 'usr_zen_pioneer_01',
      next_goal: 'DRILL_BOLLYWOOD_LYRIC',
      skill_scores: {
        akshara_orthography: 0.5,
        honorific_register: 0.5,
        speed_listening: 0.5,
        vocal_confidence: 0.5,
      },
    }),
    800
  );

  ResponseUtility.success(res, result);
});

// Autonomous Learner Model: Record Attempt
agentRouter.post('/learner/attempt', async (req, res) => {
  const result = await AgentService.callWithFallback(
    '/api/agent/learner/attempt',
    req.body,
    () => ({
      user_id: req.body?.user_id || 'usr_zen_pioneer_01',
      updated_skills: {
        akshara_orthography: 0.6,
        honorific_register: 0.5,
        speed_listening: 0.5,
        vocal_confidence: 0.5,
      },
      next_recommended_goal: 'DRILL_NANI_ETIQUETTE',
    }),
    800
  );

  ResponseUtility.success(res, result);
});

export default agentRouter;

