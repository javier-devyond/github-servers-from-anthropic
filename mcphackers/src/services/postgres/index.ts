import { Pool } from 'pg';

export class PostgresService {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      host: process.env.POSTGRES_HOST,
      port: parseInt(process.env.POSTGRES_PORT || '5432'),
      database: process.env.POSTGRES_DB,
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
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