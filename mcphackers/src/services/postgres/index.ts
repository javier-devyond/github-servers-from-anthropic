import { Pool } from 'pg';

export class PostgresService {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }

  async initialize() {
    // Test connection
    await this.pool.query('SELECT NOW()');
  }

  async query(sql: string, params: any[] = []) {
    const result = await this.pool.query(sql, params);
    return result.rows;
  }

  async execute(sql: string, params: any[] = []) {
    const result = await this.pool.query(sql, params);
    return result;
  }

  async shutdown() {
    await this.pool.end();
  }
} 