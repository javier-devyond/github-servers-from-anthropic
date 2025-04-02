import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { PostgresService } from './services/postgres';
import { RedisService } from './services/redis';
import { MemoryService } from './services/memory';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Initialize services
const postgresService = new PostgresService();
const redisService = new RedisService();
const memoryService = new MemoryService();

// Initialize services
async function initializeServices() {
  await postgresService.initialize();
  await redisService.initialize();
  await memoryService.initialize();
}

// API endpoints
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// PostgreSQL endpoints
app.post('/postgres/query', express.json(), async (req: Request, res: Response) => {
  try {
    const { sql, params } = req.body;
    const result = await postgresService.query(sql, params);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Redis endpoints
app.get('/redis/:key', async (req: Request, res: Response) => {
  try {
    const value = await redisService.get(req.params.key);
    res.json({ value });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

app.post('/redis/:key', express.json(), async (req: Request, res: Response) => {
  try {
    const { value, ttl } = req.body;
    await redisService.set(req.params.key, value, ttl);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Memory endpoints
app.get('/memory/:key', async (req: Request, res: Response) => {
  try {
    const value = await memoryService.load(req.params.key);
    res.json({ value });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

app.post('/memory/:key', express.json(), async (req: Request, res: Response) => {
  try {
    const { value } = req.body;
    await memoryService.save(req.params.key, value);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Start server
initializeServices().then(() => {
  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
  });
}).catch((error: any) => {
  console.error('Failed to initialize services:', error);
  process.exit(1);
}); 