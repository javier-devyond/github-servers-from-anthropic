import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { PostgresService } from './services/postgres';
import { RedisService } from './services/redis';
import { MemoryService } from './services/memory';
import GitHubService from './services/github';
import type { IGitHubService } from './services/github/types';
import cors from 'cors';

// Load environment variables
dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 3000;

// Enable CORS
app.use(cors());

// Initialize services
const postgresService = new PostgresService();
const redisService = new RedisService();
const memoryService = new MemoryService();
const githubService = new GitHubService();

// Initialize services
async function initializeServices() {
  await postgresService.initialize();
  await redisService.initialize();
  await memoryService.initialize();
  await githubService.initialize();
}

// SSE endpoint for Cursor MCP
app.get('/sse', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Send initial schema message
  const schema = {
    jsonrpc: "2.0",
    method: "initialize",
    params: {
      capabilities: {
        github: {
          repository: {
            get: "/github/repo/:owner/:repo",
            update: "/github/repo/:owner/:repo",
            list: "/github/repos/:owner"
          },
          content: {
            get: "/github/content/:owner/:repo/*",
            update: "/github/content/:owner/:repo/*"
          },
          issues: {
            create: "/github/issues/:owner/:repo",
            list: "/github/issues/:owner/:repo"
          },
          search: {
            code: "/github/search/code",
            repositories: "/github/search/repos"
          },
          branches: {
            create: "/github/branches/:owner/:repo",
            list: "/github/branches/:owner/:repo"
          },
          commits: {
            list: "/github/commits/:owner/:repo",
            get: "/github/commits/:owner/:repo/:sha"
          }
        }
      }
    }
  };

  res.write(`data: ${JSON.stringify(schema)}\n\n`);

  // Keep the connection alive with ping messages
  const interval = setInterval(() => {
    res.write(`data: ${JSON.stringify({ jsonrpc: "2.0", method: "ping" })}\n\n`);
  }, 30000);

  // Clean up on client disconnect
  req.on('close', () => {
    clearInterval(interval);
  });
});

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

// GitHub endpoints
app.get('/github/repo/:owner/:repo', async (req: Request, res: Response) => {
  try {
    const { owner, repo } = req.params;
    const repository = await githubService.getRepository(owner, repo);
    res.json(repository);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

app.get('/github/repos/:owner', async (req: Request, res: Response) => {
  try {
    const { owner } = req.params;
    const repositories = await githubService.listRepositories(owner);
    res.json(repositories);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

app.get('/github/content/:owner/:repo/*', async (req: Request, res: Response) => {
  try {
    const { owner, repo } = req.params;
    const path = req.params[0];
    const content = await githubService.getFileContent(owner, repo, path);
    res.json(content);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

app.post('/github/content/:owner/:repo/*', express.json(), async (req: Request, res: Response) => {
  try {
    const { owner, repo } = req.params;
    const path = req.params[0];
    const { content, message } = req.body;
    const result = await githubService.createOrUpdateFile(owner, repo, path, content, message);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

app.post('/github/issues/:owner/:repo', express.json(), async (req: Request, res: Response) => {
  try {
    const { owner, repo } = req.params;
    const { title, body } = req.body;
    const issue = await githubService.createIssue(owner, repo, title, body);
    res.json(issue);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

app.get('/github/issues/:owner/:repo', async (req: Request, res: Response) => {
  try {
    const { owner, repo } = req.params;
    const issues = await githubService.listIssues(owner, repo);
    res.json(issues);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

app.get('/github/search/code', async (req: Request, res: Response) => {
  try {
    const { query } = req.query;
    const results = await githubService.searchCode(query as string);
    res.json(results);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

app.get('/github/search/repos', async (req: Request, res: Response) => {
  try {
    const { query } = req.query;
    const results = await githubService.searchRepositories(query as string);
    res.json(results);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

app.post('/github/branches/:owner/:repo', express.json(), async (req: Request, res: Response) => {
  try {
    const { owner, repo } = req.params;
    const { branch, fromBranch } = req.body;
    const result = await githubService.createBranch(owner, repo, branch, fromBranch);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

app.get('/github/branches/:owner/:repo', async (req: Request, res: Response) => {
  try {
    const { owner, repo } = req.params;
    const branches = await githubService.listBranches(owner, repo);
    res.json(branches);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

app.get('/github/commits/:owner/:repo', async (req: Request, res: Response) => {
  try {
    const { owner, repo } = req.params;
    const { branch } = req.query;
    const commits = await githubService.listCommits(owner, repo, branch as string);
    res.json(commits);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

app.get('/github/commits/:owner/:repo/:sha', async (req: Request, res: Response) => {
  try {
    const { owner, repo, sha } = req.params;
    const commit = await githubService.getCommit(owner, repo, sha);
    res.json(commit);
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