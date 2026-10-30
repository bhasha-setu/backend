// Bhasha Setu (भाषा सेतु) — Comprehensive Database Seeder (ES Modules)
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Bhasha Setu database with full dynamic metadata...');

  // 1. Upsert Default User
  const defaultUser = await prisma.user.upsert({
    where: { id: 'usr_zen_pioneer_01' },
    update: {},
    create: {
      id: 'usr_zen_pioneer_01',
      name: 'Hindi Explorer',
      title: 'Level 3 • Setu Spoken Pioneer',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      xp: 480,
      streak: 7,
      currentLevelId: 'LEVEL_3',
      isGoldenDiyaUnlocked: true,
      isSilentMode: false,
      isAudioMuted: false,
      playbackSpeed: 1.0,
    },
  });

  console.log('✅ User seeded:', defaultUser.name);

  // 2. Seed Quest Stages (River Crossing Trail)
  const stages = [
    { stageNumber: 1, name: 'Sanskrit Roots Ghat', subtitle: 'Phonetic Foundations', description: 'Cross the introductory river rapids with pure active recall.', isCompleted: true },
    { stageNumber: 2, name: 'Wankhede Roar Bank', subtitle: 'Acoustic Cadence & Pitch', description: 'Deliver high-tempo sports commentary under crowd roar.', isCompleted: true },
    { stageNumber: 3, name: 'Purani Dilli Chaat Bazaar', subtitle: 'Rapid Spoken Negotiation', description: 'Order authentic street food with zero English crutches.', isCompleted: false },
    { stageNumber: 4, name: 'Diwali Courtyard Sanctuary', subtitle: 'Cultural Etiquette & Respect', description: 'Honorific dialogue with elders in real-time conversation.', isCompleted: false },
  ];

  for (const stage of stages) {
    await prisma.questStage.upsert({
      where: { stageNumber: stage.stageNumber },
      update: stage,
      create: stage,
    });
  }

  // 3. Seed Quest Levels
  const levels = [
    {
      id: 'LEVEL_1',
      levelNumber: 1,
      slug: 'bollywood-studio',
      title: 'Zen Bollywood Studio',
      subtitle: 'Dialogue & Spontaneous Enunciation',
      tagOverline: 'LEVEL 1 - MASTERED',
      icon: '🎬',
      route: '/bollywood-studio',
      defaultStatus: 'mastered',
      xpReward: 20,
      isIndented: false,
      orderIndex: 1,
      totalStars: 3,
    },
    {
      id: 'LEVEL_2',
      levelNumber: 2,
      slug: 'cricket-commentary',
      title: 'Zen Cricket Commentary',
      subtitle: 'Fast-Action Sentence Framing',
      tagOverline: 'LEVEL 2 - MASTERED',
      icon: '🏏',
      route: '/cricket-commentary',
      defaultStatus: 'mastered',
      xpReward: 35,
      isIndented: true,
      orderIndex: 2,
      totalStars: 3,
    },
    {
      id: 'LEVEL_3',
      levelNumber: 3,
      slug: 'street-food',
      title: 'Level 3: Street Food Masterchef',
      subtitle: 'Order authentic chaat and negotiate portions using zero English crutches.',
      tagOverline: 'ACTIVE QUEST - NOW PLAYING',
      icon: '🍲',
      route: '/street-food',
      defaultStatus: 'active',
      xpReward: 50,
      ctaLabel: 'Play Quest • +50 XP →',
      isIndented: false,
      orderIndex: 3,
      totalStars: 3,
    },
    {
      id: 'LEVEL_4',
      levelNumber: 4,
      slug: 'diwali-nani-boss',
      title: 'Diwali WhatsApp Call with Nani',
      subtitle: 'Master 3-Minute Live Dialogue Flow',
      tagOverline: 'BOSS QUEST - FINAL BRIDGE',
      icon: '🪔',
      route: '/diwali-nani-boss',
      defaultStatus: 'locked',
      xpReward: 100,
      ctaLabel: 'Challenge Boss • +100 XP →',
      isIndented: true,
      orderIndex: 4,
      totalStars: 3,
    },
  ];

  for (const lvl of levels) {
    await prisma.questLevel.upsert({
      where: { id: lvl.id },
      update: lvl,
      create: lvl,
    });
  }

  // 4. Seed Drills
  const drills = [
    {
      id: 'drill-bollywood-01',
      levelId: 'LEVEL_1',
      drillType: 'BOLLYWOOD',
      title: '1976 Classic Lyric Recall',
      categoryOverline: 'BOLLYWOOD STUDIO • 1976 CLASSIC',
      scenario: 'Complete the iconic lyric from the 1976 classic Kabhi Kabhie.',
      hindiPrompt: 'कभी कभी मेरे [ _ _ _ _ ] में ख़्याल आता है',
      englishTranslation: 'Sometimes a thought comes into my [heart]',
      romanPrompt: 'Kabhi kabhie mere [dil] mein khayaal aata hai',
      targetWord: 'दिल',
      phoneticHint: 'Phonetic Clue: Rhymes with "Bill", starts with "द" (meaning "heart").',
      audioClipId: 'kabhi-kabhi-lyric',
      defaultSpeed: 0.75,
      audioDuration: '0:05',
      xpAward: 20,
      comboMultiplier: 2,
      metadata: {
        verseLines: ['कभी कभी मेरे', 'में ख़्याल', 'आता है'],
        movieYear: '1976',
        filmTitle: 'Kabhi Kabhie',
      },
    },
    {
      id: 'drill-cricket-01',
      levelId: 'LEVEL_2',
      drillType: 'CRICKET',
      title: 'Wankhede Stadium Roar Drill',
      categoryOverline: 'LIVE HINDI VOICE DRILL',
      scenario: 'Shout the commentary line when Virat Kohli hits the winning six at Wankhede Stadium!',
      hindiPrompt: 'आख़िरी गेंद पर शानदार छक्का!',
      englishTranslation: 'A fantastic six on the final delivery!',
      romanPrompt: 'Aakhiri gend par shaandaar chhakka!',
      targetWord: 'छक्का!',
      phoneticHint: 'Pronounce the aspirated "छ" firmly and hold the roar cadence.',
      audioClipId: 'cricket-commentary-crowd',
      defaultSpeed: 1.0,
      audioDuration: '0:04',
      xpAward: 35,
      comboMultiplier: 2,
      metadata: {
        overNotation: 'Over 19.6',
        thrillerBadge: 'MATCH THRILLER • FINAL BALL',
        targetDecibels: 92,
        dailyFlipPhrase: '“आख़िरी मिनट पर”',
        dailyFlipMeaning: 'At the last minute',
      },
    },
    {
      id: 'drill-streetfood-01',
      levelId: 'LEVEL_3',
      drillType: 'STREET_FOOD',
      title: 'Pani Puri Counter Rapid-Fire',
      categoryOverline: 'STREET FOOD KITCHEN • ORDER 3 OF 5',
      scenario: 'Order your custom pani puri plate at the street vendor cart in rapid-fire Hindi.',
      hindiPrompt: 'भैया, पानी पूरी थोड़ा [ _ _ _ _ ] और कम मीठा बनाना।',
      englishTranslation: 'Make the Pani Puri a little [spicy] and less sweet.',
      romanPrompt: 'Bhaiya, pani puri thoda [teekha] aur kam meetha banana.',
      targetWord: 'तीखा',
      phoneticHint: 'Starts with "त" with long vowel "ी" (meaning Spicy / Hot).',
      audioClipId: 'pani-puri-order',
      defaultSpeed: 0.8,
      audioDuration: '0:04',
      xpAward: 50,
      comboMultiplier: 2,
      metadata: {
        location: 'Old Delhi Chaat Bazaar',
        stallName: 'Pani Puri Cart • Old Delhi',
        customerRequestHindi: 'भैया, तीखा पानी पूरी चाहिए या मीठा?',
      },
    },
    {
      id: 'drill-naniboss-01',
      levelId: 'LEVEL_4',
      drillType: 'NANI_BOSS',
      title: 'Diwali Nani Boss Encounter',
      categoryOverline: 'WHATSAPP VOICE CONVERSATION',
      scenario: 'Your grandmother calls on WhatsApp for Diwali. Greet her respectfully before the crackers start!',
      hindiPrompt: 'नमस्ते बेटा! दिवाली की बहुत-बहुत शुभकामनाएँ। घर कब आ रहे हो?',
      englishTranslation: 'Greetings son! Happy Diwali. When are you coming home?',
      romanPrompt: 'Namaste beta! Diwali ki bahut-bahut shubhkaamnayein. Ghar kab aa rahe ho?',
      targetWord: 'आप',
      phoneticHint: 'Always use the honorific pronoun "आप" instead of informal "तू".',
      audioClipId: 'nani-diwali-call',
      defaultSpeed: 1.0,
      audioDuration: '0:14',
      xpAward: 100,
      comboMultiplier: 2,
      metadata: {
        senderName: 'Nani (दादी/नानी)',
        callType: 'WhatsApp Voice Call',
        respectMarkersRequired: ['आप', 'नमस्ते', 'प्रणाम', 'जी'],
      },
    },
  ];

  for (const drill of drills) {
    await prisma.drill.upsert({
      where: { id: drill.id },
      update: drill,
      create: drill,
    });
  }

  // 5. Seed Cultural Artifacts
  const artifacts = [
    {
      id: 'vintage-mic',
      slug: 'vintage-mic',
      name: 'Vintage Mic',
      icon: '🎙️',
      levelName: 'Level 1: Bollywood Studio',
      description: 'Mastered spontaneous lyric enunciation without multiple-choice cues.',
      bonus: '+20 XP Active Recall Boost',
      unlockCondition: 'Complete Bollywood Studio lyric recall drill with 100% accuracy.',
      orderIndex: 1,
    },
    {
      id: 'cricket-ball',
      slug: 'cricket-ball',
      name: 'Cricket Ball',
      icon: '🏏',
      levelName: 'Level 2: Cricket Commentary',
      description: 'Spoke match-winning commentary with authentic Wankhede stadium cadence.',
      bonus: '+35 XP Fluency Cadence',
      unlockCondition: 'Achieve 90%+ roar decibels on the final ball commentary drill.',
      orderIndex: 2,
    },
    {
      id: 'chai-kulhad',
      slug: 'chai-kulhad',
      name: 'Chai Kulhad',
      icon: '☕',
      levelName: 'Level 3: Street Food Masterchef',
      description: 'Negotiated authentic street food portions using zero English crutches.',
      bonus: '+50 XP Negotiation Mastery',
      unlockCondition: 'Successfully recall spicy and sweet culinary modifiers in rapid Hindi.',
      orderIndex: 3,
    },
    {
      id: 'golden-diya',
      slug: 'golden-diya',
      name: 'Golden Diya',
      icon: '🪔',
      levelName: 'Boss Level: Diwali Call with Nani',
      description: 'Maintained 3-minute live conversational Hindi with natural respect markers.',
      bonus: '+100 XP Cultural Fluency',
      unlockCondition: 'Complete the Nani WhatsApp encounter using honorific etiquette markers.',
      orderIndex: 4,
    },
  ];

  for (const art of artifacts) {
    await prisma.artifact.upsert({
      where: { id: art.id },
      update: art,
      create: art,
    });
  }

  // 6. Seed User Artifact Unlocks
  const userArtifactIds = ['vintage-mic', 'cricket-ball', 'chai-kulhad', 'golden-diya'];
  for (const artId of userArtifactIds) {
    await prisma.userArtifact.upsert({
      where: {
        userId_artifactId: {
          userId: defaultUser.id,
          artifactId: artId,
        },
      },
      update: {},
      create: {
        userId: defaultUser.id,
        artifactId: artId,
      },
    });
  }

  // 7. Seed User Level Progress
  const userProgresses = [
    { levelId: 'LEVEL_1', stars: 3, status: 'mastered', score: 100, completedAt: new Date() },
    { levelId: 'LEVEL_2', stars: 3, status: 'mastered', score: 95, completedAt: new Date() },
    { levelId: 'LEVEL_3', stars: 1, status: 'active', score: 60, completedAt: null },
    { levelId: 'LEVEL_4', stars: 0, status: 'locked', score: 0, completedAt: null },
  ];

  for (const prog of userProgresses) {
    await prisma.userLevelProgress.upsert({
      where: {
        userId_levelId: {
          userId: defaultUser.id,
          levelId: prog.levelId,
        },
      },
      update: prog,
      create: {
        userId: defaultUser.id,
        ...prog,
      },
    });
  }

  // 8. Seed Initial WhatsApp Chat History with Nani
  const initialMessages = [
    {
      id: 'nani-turn-1',
      userId: defaultUser.id,
      sender: 'nani',
      duration: '0:04',
      hindiText: '“नमस्ते बेटा! दिवाली की बहुत-बहुत शुभकामनाएँ। घर कब आ रहे हो?”',
      englishSubtext: '“Greetings son! Happy Diwali. When are you coming home?”',
      timestamp: '10:14 AM',
    },
    {
      id: 'user-turn-2',
      userId: defaultUser.id,
      sender: 'user',
      duration: '0:05',
      hindiText: '“नमस्ते नानी! मैं कल सुबह मिठाई लेकर आ रहा हूँ।”',
      englishSubtext: '“Greetings Nani! I am coming tomorrow morning with sweets.”',
      fluencyScore: 96,
      respectWord: 'आप',
      timestamp: '10:15 AM',
    },
    {
      id: 'nani-turn-3',
      userId: defaultUser.id,
      sender: 'nani',
      duration: '0:03',
      hindiText: '“वाह! मैं तुम्हारी मनपसंद खीर बना के रखूँगी। 🪔”',
      englishSubtext: '“Wonderful! I will prepare your favorite kheer.”',
      timestamp: '10:15 AM',
    },
  ];

  for (const msg of initialMessages) {
    await prisma.chatMessage.upsert({
      where: { id: msg.id },
      update: msg,
      create: msg,
    });
  }

  // 9. Seed Cultural Spoken Milestones
  const milestones = [
    {
      id: 'milestone-01',
      title: 'Deewani Mastani Enunciation',
      description: 'Active Lyric Recall Mastered',
      requiredLevelId: 'LEVEL_1',
      orderIndex: 1,
    },
    {
      id: 'milestone-02',
      title: 'Wankhede Commentary Cadence',
      description: 'Match Thriller Spoken Drill Completed',
      requiredLevelId: 'LEVEL_2',
      orderIndex: 2,
    },
    {
      id: 'milestone-03',
      title: 'Chandni Chowk Bargainer',
      description: 'Spontaneous Hindi Street Negotiation',
      requiredLevelId: 'LEVEL_3',
      orderIndex: 3,
    },
    {
      id: 'milestone-04',
      title: 'Nani Ki Ladli / Ladla',
      description: '100% Respectful Tone & Fluency Dialogue',
      requiredLevelId: 'LEVEL_4',
      requiredArtifactId: 'golden-diya',
      orderIndex: 4,
    },
  ];

  for (const ms of milestones) {
    await prisma.culturalMilestone.upsert({
      where: { id: ms.id },
      update: ms,
      create: ms,
    });
  }

  console.log('✨ Database successfully seeded with all Bhasha Setu game metadata!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

