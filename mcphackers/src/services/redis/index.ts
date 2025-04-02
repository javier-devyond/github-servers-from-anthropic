import { createClient } from 'redis';

export class RedisService {
  private client;

  constructor() {
    const host = process.env.REDIS_HOST;
    const port = process.env.REDIS_PORT;
    const password = process.env.REDIS_PASSWORD;

    if (!host || !port) {
      throw new Error('Redis configuration is missing. Please check your environment variables.');
    }

    this.client = createClient({
      url: `redis://${host}:${port}`,
      password: password
    });
  }

  async initialize() {
    await this.client.connect();
  }

  async get(key: string) {
    return await this.client.get(key);
  }

  async set(key: string, value: string, ttl?: number) {
    if (ttl) {
      await this.client.setEx(key, ttl, value);
    } else {
      await this.client.set(key, value);
    }
  }

  async del(key: string) {
    await this.client.del(key);
  }

  async exists(key: string) {
    return await this.client.exists(key);
  }

  async shutdown() {
    await this.client.quit();
  }
} 