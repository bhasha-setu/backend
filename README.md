# 🌉 Bhasha Setu Backend (भाषा सेतु — Backend Server)

> **Enterprise Node.js • Express • Prisma • PostgreSQL • Real-Time WebSockets • TypeScript**

High-performance, modular backend server for **Bhasha Setu (भाषा सेतु — "The Language Bridge")**, supporting 100% active-recall Hindi learning, live voice commentary, WhatsApp voice simulations with Nani, and dynamic gamification.

---

## 🏗️ Architecture & Folder Structure

The backend strictly follows a modular, feature-first structure with clean separation of concerns:

```
bhasha_setu_backend/
├── prisma/
│   ├── schema.prisma                  # PostgreSQL database schema
│   └── seed.ts                        # Comprehensive dynamic metadata seeder
├── src/
│   ├── index.ts                       # Application entrypoint (HTTP + WS bootstrap)
│   ├── app.ts                         # Express app configuration & middleware
│   ├── database/
│   │   └── prisma.client.ts           # Singleton PrismaClient with clean connection lifecycle
│   ├── lib/
│   │   └── constants/                 # Mapped to frontend tokens & contracts
│   │       ├── app.constants.ts       # HTTP codes, port, thresholds
│   │       ├── zen.constants.ts       # Zen theme palette & design tokens
│   │       ├── quest.constants.ts     # Stages, levels, stars, chest XP
│   │       ├── drill.constants.ts     # Drill types, XP rewards, speeds
│   │       ├── artifact.constants.ts  # Cultural artifacts definitions & boosts
│   │       ├── respect.constants.ts   # Honorific & informal Hindi markers
│   │       ├── websocket.constants.ts # Client & Server WebSocket event names
│   │       └── index.ts               # Central export barrel
│   ├── middleware/
│   │   ├── errorHandler.middleware.ts # Global operational & Prisma error handler
│   │   ├── validate.middleware.ts     # Zod schema validation for req.body/params/query
│   │   ├── requestLogger.middleware.ts# Request duration & status logging
│   │   └── notFound.middleware.ts     # 404 handler for unmatched routes
│   ├── utilities/
│   │   ├── devanagari.utility.ts      # Hindi text normalization & phonetic matching
│   │   ├── response.utility.ts        # Standardized API response formatters
│   │   ├── logger.utility.ts          # Structured, colored logger
│   │   └── audioCadence.utility.ts    # Decibels, roar percentage & respect analysis
│   ├── quests/                        # FEATURE 1: Quest Map & River Crossing Path
│   │   ├── quests.routes.ts           # /api/quests/map, /api/quests/levels/:id
│   │   ├── quests.controller.ts       # Request handlers & param parsing
│   │   └── quests.service.ts          # Quest map, stages, chest progress, level progression
│   ├── drills/                        # FEATURE 2: Bollywood, Cricket, Street Food, Nani
│   │   ├── drills.routes.ts           # /api/drills/:type, /evaluate/answer, /evaluate/voice
│   │   ├── drills.controller.ts       # Drill dispatcher
│   │   └── drills.service.ts          # Active-recall Devanagari validation, audio metadata
│   ├── artifacts/                     # FEATURE 3: Cultural Artifacts Shelf
│   │   ├── artifacts.routes.ts        # /api/artifacts, /api/artifacts/:id/unlock
│   │   ├── artifacts.controller.ts    # Shelf handlers
│   │   └── artifacts.service.ts       # Artifact inventory, XP boosts & Golden Diya
│   ├── profile/                       # FEATURE 4: User Profile, Streaks & WhatsApp Chat
│   │   ├── profile.routes.ts          # /api/profile, /preferences, /weekly-streak, /nani-chat
│   │   ├── profile.controller.ts      # Profile, streaks & WhatsApp chat handlers
│   │   └── profile.service.ts         # User stats, weekly practice days, Nani chat history
│   └── websockets/                    # FEATURE 5: Real-Time Bidirectional Voice Drills
│       ├── websocket.types.ts         # ExtendedWebSocket, frames & event contracts
│       ├── websocket.service.ts       # ASR partial streaming, Nani AI dialogue generation
│       ├── websocket.controller.ts    # WebSocket frame dispatcher & safe sender
│       └── websocket.manager.ts       # Connection registry, heartbeats, clean attach/detach
├── .env                               # Active environment variables
├── .env.example                       # Environment template
├── package.json                       # Dependencies & modern ES scripts
└── tsconfig.json                      # Strict TypeScript NodeNext configuration
```

---

## ⚡ Quick Start

### 1. Install Dependencies
```bash
cd "D:\projects\Bhasha Setu\bhasha_setu_backend"
npm install
```

### 2. Configure Environment (`.env`)
Make sure your PostgreSQL instance is running, then configure `DATABASE_URL` in `.env`:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/bhasha_setu?schema=public"
CORS_ORIGIN=*
WS_PATH=/ws/drill
WS_HEARTBEAT_INTERVAL_MS=30000
DEFAULT_USER_ID=usr_zen_pioneer_01
GOLDEN_DIYA_FLUENCY_THRESHOLD=85
COMBO_MULTIPLIER=2
```

### 3. Generate Prisma Client & Migrate Database
```bash
npm run prisma:generate
npm run prisma:migrate
```

### 4. Seed Dynamic Metadata
```bash
npm run prisma:seed
```

### 5. Start Development Server
```bash
npm run dev
```
* HTTP API running at: `http://localhost:5000`
* WebSocket Drill Server running at: `ws://localhost:5000/ws/drill`
* Health Check: `http://localhost:5000/health`

---

## 📡 REST API Endpoints

### 🗺️ Quests & River Crossing Map
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/quests/map` | Dynamic Quest Map, River Crossing stages, level nodes, and milestone chest |
| `GET` | `/api/quests/levels/:levelId` | Single level details with associated active-recall drills |
| `POST` | `/api/quests/levels/:levelId/complete` | Complete a level, award XP, update streak, unlock next level |

### 🎙️ Drills & Answer Evaluation
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/drills/:drillType` | Retrieve drill metadata (`BOLLYWOOD`, `CRICKET`, `STREET_FOOD`, `NANI_BOSS`) |
| `POST` | `/api/drills/evaluate/answer` | Check Devanagari typed answer (exact match, phonetic normalization, combo multiplier) |
| `POST` | `/api/drills/evaluate/voice` | Evaluate spoken turn (cadence, acoustic decibels, pitch, honorific respect markers) |
| `GET` | `/api/drills/audio/:clipId` | Audio prompt metadata & speed adjustments (1.0x, 0.8x, 0.75x) |

### 🏺 Cultural Artifacts
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/artifacts` | Full Cultural Artifacts Shelf (`vintage-mic`, `cricket-ball`, `chai-kulhad`, `golden-diya`) |
| `POST` | `/api/artifacts/:artifactId/unlock` | Unlock artifact & award XP boost |

### 👤 Profile, Streaks & WhatsApp Chat
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/profile` | User stats grid, total XP, current streak, mastered levels |
| `PATCH`| `/api/profile/preferences` | Update user settings (`isSilentMode`, `isAudioMuted`, `playbackSpeed`) |
| `GET` | `/api/profile/weekly-streak` | 7-day practice tracker (`['M', 'T', 'W', 'T', 'F', 'S', 'S']`) |
| `GET` | `/api/profile/milestones` | Dynamic cultural spoken milestones |
| `GET` | `/api/profile/nani-chat` | Full WhatsApp voice dialogue history with Nani |
| `POST` | `/api/profile/nani-chat` | Post a chat message to the Nani WhatsApp dialogue |

---

## 🔊 WebSocket Engine (`/ws/drill`)

The WebSocket engine is managed by `WebSocketManager` with clean listener attachment, heartbeat monitoring, and automatic listener removal on disconnect.

### Connection URL
```
ws://localhost:5000/ws/drill?agent=CRICKET_AGENT&userId=usr_zen_pioneer_01
ws://localhost:5000/ws/drill?agent=NANI_BOSS_AGENT&userId=usr_zen_pioneer_01
```

### Client -> Server Events

#### 1. Microphone Streaming Chunks (`user_audio`)
```json
{
  "event": "user_audio",
  "data": "UklGRi...",
  "db": 92.5
}
```
**Server Response (`asr_partial`):**
```json
{
  "event": "asr_partial",
  "text_hi": "शानदार छक्का!",
  "clarity_percent": 94
}
```

#### 2. Silent Text Fallback (`user_text`)
```json
{
  "event": "user_text",
  "text": "नमस्ते नानी जी, आप कैसी हैं?"
}
```
**Server Response (`ai_voice_note`):**
```json
{
  "event": "ai_voice_note",
  "id": "1730301000",
  "text_hi": "“जीते रहो बेटा! तुम्हारा इंतज़ार रहेगा। खूब खुश रहो! 🪔”",
  "text_en": "“Live long son! I will be waiting for you. Stay blessed!”",
  "duration": "0:04",
  "timestamp": "10:16 AM"
}
```

#### 3. Real-Time Audio Frames (`audio_frame`)
```json
{
  "action": "audio_frame",
  "sequence": 14,
  "db": 95.0
}
```
**Server Response (`evaluated`):**
```json
{
  "status": "evaluated",
  "roar_percentage": 92,
  "stadium_reaction": "CHOWKA_CHHAKKA",
  "xp_earned": 35
}
```

