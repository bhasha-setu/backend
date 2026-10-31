// test-integration.ts
// End-to-End integration test suite verifying backend and frontend communication

const BASE_URL = 'http://localhost:5000';
const WS_URL = 'ws://localhost:5000/ws/drill';
const USER_ID = 'usr_zen_pioneer_01';

interface TestResult {
  name: string;
  passed: boolean;
  details?: string;
}

const results: TestResult[] = [];

async function assertApi(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    results.push({ name, passed: true });
    console.log(`✅ [PASS] ${name}`);
  } catch (err: any) {
    results.push({ name, passed: false, details: err.message || String(err) });
    console.error(`❌ [FAIL] ${name}:`, err.message || err);
  }
}

async function run() {
  console.log('\n🚀 Starting Bhasha Setu End-to-End Integration Tests...\n');

  // 1. Health check
  await assertApi('Health Check Endpoint (GET /health)', async () => {
    const res = await fetch(`${BASE_URL}/health`);
    const json = await res.json();
    if (!res.ok || !json.success || json.data.status !== 'healthy') {
      throw new Error(`Health check failed: ${JSON.stringify(json)}`);
    }
  });

  // 2. Quest Map (used by QuestMapScreen & useFrontendStore)
  await assertApi('Quest Map API (GET /api/quests/map)', async () => {
    const res = await fetch(`${BASE_URL}/api/quests/map?userId=${USER_ID}`, {
      headers: { 'x-user-id': USER_ID },
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message);
    const { hud, riverTrail, levels, milestoneChest, heroCard } = json.data;
    if (!hud || !riverTrail || !levels || levels.length !== 4) {
      throw new Error('Quest map data structure mismatch');
    }
    if (!hud.currentLevel || hud.streakDays < 1 || typeof hud.xpPoints !== 'number') {
      throw new Error(`HUD state unexpected: ${JSON.stringify(hud)}`);
    }
  });

  // 3. Quest Level Details & Completion (used by Level Screens)
  await assertApi('Quest Level Details (GET /api/quests/levels/:id)', async () => {
    const res = await fetch(`${BASE_URL}/api/quests/levels/LEVEL_1?userId=${USER_ID}`, {
      headers: { 'x-user-id': USER_ID },
    });
    const json = await res.json();
    if (!res.ok || !json.success || json.data.id !== 'LEVEL_1') {
      throw new Error('Failed to fetch level details');
    }
  });

  await assertApi('Complete Level (POST /api/quests/levels/:id/complete)', async () => {
    const res = await fetch(`${BASE_URL}/api/quests/levels/LEVEL_1/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': USER_ID },
      body: JSON.stringify({ userId: USER_ID, stars: 3, score: 100 }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message);
  });

  // 4. Drill: Bollywood Studio (Screen 2: Lyric Recall 'दिल')
  await assertApi('Drill Bollywood (GET /api/drills/bollywood)', async () => {
    const res = await fetch(`${BASE_URL}/api/drills/bollywood?userId=${USER_ID}`, {
      headers: { 'x-user-id': USER_ID },
    });
    const json = await res.json();
    if (!res.ok || !json.success || json.data.targetWord !== 'दिल') {
      throw new Error(`Bollywood drill mismatch: targetWord=${json.data?.targetWord}`);
    }
  });

  // 5. Active Recall Evaluation (Screen 2: Typed Devanagari answer)
  await assertApi('Devanagari Answer Evaluation (POST /api/drills/evaluate/answer)', async () => {
    const res = await fetch(`${BASE_URL}/api/drills/evaluate/answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': USER_ID },
      body: JSON.stringify({
        drillType: 'BOLLYWOOD',
        typedWord: 'दिल',
        expectedWord: 'दिल',
        userId: USER_ID,
      }),
    });
    const json = await res.json();
    if (!res.ok || !json.success || !json.data.isCorrect || json.data.xpAwarded !== 20) {
      throw new Error(`Answer evaluation failed: ${JSON.stringify(json)}`);
    }
  });

  // 6. Voice Evaluation & Cultural Etiquette (Screen 3 & Screen 5: Nani WhatsApp Call)
  await assertApi('Spoken Cadence & Respect Markers (POST /api/drills/evaluate/voice)', async () => {
    const res = await fetch(`${BASE_URL}/api/drills/evaluate/voice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': USER_ID },
      body: JSON.stringify({
        spokenText: 'नमस्ते नानी जी, आप कैसी हैं?',
        drillType: 'NANI_BOSS',
        decibels: 88.0,
        pitchHz: 220.0,
        userId: USER_ID,
      }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message);
    const { fluencyScore, respectMarkersFound, unlockGoldenDiya } = json.data;
    if (fluencyScore < 85 || !respectMarkersFound.includes('आप') || !unlockGoldenDiya) {
      throw new Error(`Voice evaluation unexpected: ${JSON.stringify(json.data)}`);
    }
  });

  // 7. Cultural Artifacts Shelf (ArtifactsModal)
  await assertApi('Artifacts Shelf (GET /api/artifacts)', async () => {
    const res = await fetch(`${BASE_URL}/api/artifacts?userId=${USER_ID}`, {
      headers: { 'x-user-id': USER_ID },
    });
    const json = await res.json();
    if (!res.ok || !json.success || json.data.artifacts.length !== 4) {
      throw new Error('Failed to retrieve artifacts shelf');
    }
  });

  // 8. User Profile & Preferences (ProfileModal)
  await assertApi('User Profile (GET /api/profile)', async () => {
    const res = await fetch(`${BASE_URL}/api/profile?userId=${USER_ID}`, {
      headers: { 'x-user-id': USER_ID },
    });
    const json = await res.json();
    if (!res.ok || !json.success || json.data.profile.id !== USER_ID) {
      throw new Error('Failed to retrieve user profile');
    }
  });

  await assertApi('Update Preferences (PATCH /api/profile/preferences)', async () => {
    const res = await fetch(`${BASE_URL}/api/profile/preferences`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-user-id': USER_ID },
      body: JSON.stringify({ isSilentMode: false, isAudioMuted: false, playbackSpeed: 0.8, userId: USER_ID }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error('Preferences update failed');
  });

  // 9. Nani WhatsApp Chat History & Message Sending (DiwaliNaniBossScreen & useFrontendStore)
  await assertApi('Nani Chat History (GET /api/profile/nani-chat)', async () => {
    const res = await fetch(`${BASE_URL}/api/profile/nani-chat?userId=${USER_ID}`, {
      headers: { 'x-user-id': USER_ID },
    });
    const json = await res.json();
    if (!res.ok || !json.success || !json.data.messages || json.data.messages.length < 1) {
      throw new Error('Failed to retrieve Nani chat history');
    }
  });

  await assertApi('Send Nani Chat Message (POST /api/profile/nani-chat)', async () => {
    const res = await fetch(`${BASE_URL}/api/profile/nani-chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': USER_ID },
      body: JSON.stringify({
        sender: 'user',
        hindiText: 'शुभ दीपावली नानी जी!',
        englishSubtext: 'Happy Diwali Nani!',
        fluencyScore: 95,
        respectWord: 'जी',
        userId: USER_ID,
      }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error('Failed to send Nani chat message');
  });

  // 10. Real-Time WebSockets Voice Drill Session
  await assertApi('WebSocket Voice Drill Session (ws://localhost:5000/ws/drill)', async () => {
    const WebSocket = (await import('ws')).default;
    await new Promise<void>((resolve, reject) => {
      const ws = new WebSocket(`${WS_URL}?agent=CRICKET_AGENT&userId=${USER_ID}`);
      const timeout = setTimeout(() => {
        ws.terminate();
        reject(new Error('WebSocket connection timed out'));
      }, 3000);

      ws.on('open', () => {
        ws.send(JSON.stringify({
          event: 'audio_chunk',
          agentKey: 'CRICKET_AGENT',
          payload: { decibels: 92, spokenText: 'धोनी ने मारा शानदार छक्का!' }
        }));
      });

      ws.on('message', (data: any) => {
        clearTimeout(timeout);
        const parsed = JSON.parse(data.toString());
        if (parsed.event === 'connected') {
          ws.close();
          resolve();
        }
      });

      ws.on('error', (err) => {
        clearTimeout(timeout);
        reject(err);
      });
    });
  });

  // 11. AI Agent Microservice Proxy with 800ms Fallback
  await assertApi('AI Agent Proxy Health (GET /api/agent/health)', async () => {
    const res = await fetch(`${BASE_URL}/api/agent/health`);
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error('Agent health check failed');
  });

  await assertApi('AI Agent Clause-Scoped Register Scorer (POST /api/agent/tutor/turn)', async () => {
    const res = await fetch(`${BASE_URL}/api/agent/tutor/turn`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_text: 'नमस्ते नानी जी, आप कैसी हैं?' }),
    });
    const json = await res.json();
    if (!res.ok || !json.success || json.data.status !== 'RESPECTFUL_PERFECT' || !json.data.unlock_golden_diya) {
      throw new Error(`Register evaluation failed: ${JSON.stringify(json)}`);
    }
  });

  await assertApi('AI Agent Autonomous Learner Model (POST /api/agent/learner/next-goal)', async () => {
    const res = await fetch(`${BASE_URL}/api/agent/learner/next-goal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: USER_ID }),
    });
    const json = await res.json();
    if (!res.ok || !json.success || !json.data.next_goal) {
      throw new Error('Autonomous goal recommendation failed');
    }
  });

  console.log('\n=============================================');
  console.log(`TOTAL TESTS: ${results.length}`);
  console.log(`PASSED: ${results.filter((r) => r.passed).length}`);
  console.log(`FAILED: ${results.filter((r) => !r.passed).length}`);
  console.log('=============================================\n');

  if (results.some((r) => !r.passed)) {
    process.exit(1);
  }
}

run();
