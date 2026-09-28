import { PrismaClient } from '@prisma/client';

export interface DatabaseHealth {
  status: 'UP' | 'DOWN';
  engine: string;
  url?: string;
  migrationsApplied?: number;
  activeTransactions?: number;
  error?: string;
}

export class DatabaseCorePrisma {
  private static instance: DatabaseCorePrisma | null = null;
  private prisma: PrismaClient;

  private constructor() {
    this.prisma = new PrismaClient();
  }

  public static getInstance(): DatabaseCorePrisma {
    if (!DatabaseCorePrisma.instance) {
      DatabaseCorePrisma.instance = new DatabaseCorePrisma();
    }
    return DatabaseCorePrisma.instance;
  }

  public async connect(): Promise<void> {
    await this.prisma.$connect();
    console.log('[DATABASE-CORE-PRISMA] Connected to Postgres via Prisma');
  }

  public getRawClient(): PrismaClient {
    return this.prisma;
  }

  // Generic run - execute raw SQL (for compatibility)
  public async run(sql: string, params: any[] = []): Promise<any> {
    return this.prisma.$executeRawUnsafe(sql, ...params);
  }

  public async get<T = any>(sql: string, params: any[] = []): Promise<T | null> {
    const res = await this.prisma.$queryRawUnsafe(sql, ...params);
    if (Array.isArray(res)) return (res[0] as T) ?? null;
    return (res as T) ?? null;
  }

  public async all<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    const res = await this.prisma.$queryRawUnsafe(sql, ...params);
    return (res as T[]) ?? [];
  }

  public async transaction<T>(cb: (tx: PrismaClient) => Promise<T>): Promise<T> {
    return this.prisma.$transaction(async (tx) => cb(tx));
  }

  public async health(): Promise<DatabaseHealth> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'UP', engine: 'postgresql' };
    } catch (e: any) {
      return { status: 'DOWN', engine: 'postgresql', error: String(e) };
    }
  }
}
