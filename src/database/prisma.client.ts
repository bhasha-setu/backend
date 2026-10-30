// src/database/prisma.client.ts
import { PrismaClient } from '@prisma/client';
import { Logger } from '../utilities/logger.utility.js';

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const prisma =
  global.__prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['error', 'warn']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.__prisma = prisma;
}

export const connectDatabase = async (): Promise<void> => {
  try {
    await prisma.$connect();
    Logger.info('⚡ Connected to PostgreSQL database via Prisma');
  } catch (error) {
    Logger.error('❌ Failed to connect to database:', error);
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  await prisma.$disconnect();
  Logger.info('🛑 Database disconnected cleanly');
};

