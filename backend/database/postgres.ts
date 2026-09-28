import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';

export class PostgresInfrastructureError extends Error {
  public readonly code: string;

  constructor(code: string, message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = 'PostgresInfrastructureError';
    this.code = code;
  }
}

export interface PostgresConfig {
  connectionString: string;
  maxConnections: number;
  connectionTimeoutMs: number;
  statementTimeoutMs: number;
  idleTimeoutMs: number;
}

export class PostgresConnection {
  public readonly pool: Pool;

  constructor(config: PostgresConfig) {
    if (!config.connectionString) {
      throw new PostgresInfrastructureError('DATABASE_NOT_CONFIGURED', 'DATABASE_URL is required for PostgreSQL.');
    }
    this.pool = new Pool({
      connectionString: config.connectionString,
      max: config.maxConnections,
      connectionTimeoutMillis: config.connectionTimeoutMs,
      idleTimeoutMillis: config.idleTimeoutMs,
      statement_timeout: config.statementTimeoutMs
    });
    this.pool.on('error', error => {
      console.error('[POSTGRES] Idle client error:', error.message);
    });
  }

  public async query<T extends QueryResultRow = QueryResultRow>(
    text: string,
    values: unknown[] = []
  ): Promise<QueryResult<T>> {
    try {
      return await this.pool.query<T>(text, values);
    } catch (error) {
      throw new PostgresInfrastructureError('DATABASE_QUERY_FAILED', 'PostgreSQL query failed.', { cause: error });
    }
  }

  public async healthCheck(): Promise<{ status: 'UP' | 'DOWN'; latencyMs: number }> {
    const started = Date.now();
    try {
      await this.query('SELECT 1');
      return { status: 'UP', latencyMs: Date.now() - started };
    } catch {
      return { status: 'DOWN', latencyMs: Date.now() - started };
    }
  }

  public async close(): Promise<void> {
    await this.pool.end();
  }
}

export class PostgresTransactionManager {
  constructor(private readonly connection: PostgresConnection) {}

  public async run<T>(work: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.connection.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await work(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      try {
        await client.query('ROLLBACK');
      } catch (rollbackError) {
        throw new PostgresInfrastructureError('DATABASE_ROLLBACK_FAILED', 'PostgreSQL rollback failed.', {
          cause: rollbackError
        });
      }
      throw error;
    } finally {
      client.release();
    }
  }
}

export function postgresConfigFromEnvironment(): PostgresConfig {
  return {
    connectionString: process.env.DATABASE_URL || '',
    maxConnections: Number(process.env.POSTGRES_POOL_MAX || 10),
    connectionTimeoutMs: Number(process.env.POSTGRES_CONNECTION_TIMEOUT_MS || 5000),
    statementTimeoutMs: Number(process.env.POSTGRES_STATEMENT_TIMEOUT_MS || 15000),
    idleTimeoutMs: Number(process.env.POSTGRES_IDLE_TIMEOUT_MS || 30000)
  };
}
