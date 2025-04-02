import { Octokit } from '@octokit/rest';

export class GitHubService {
  private octokit: Octokit;

  constructor() {
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      throw new Error('GITHUB_TOKEN environment variable is required');
    }
    this.octokit = new Octokit({ auth: token });
  }

  async initialize() {
    // Verificar que el token es válido
    try {
      await this.octokit.users.getAuthenticated();
    } catch (error: any) {
      throw new Error(`Failed to initialize GitHub service: ${error.message}`);
    }
  }

  async getRepository(owner: string, repo: string) {
    try {
      const response = await this.octokit.repos.get({
        owner,
        repo,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to get repository: ${error.message}`);
    }
  }

  async listRepositories(owner: string) {
    try {
      const response = await this.octokit.repos.listForUser({
        username: owner,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to list repositories: ${error.message}`);
    }
  }

  async getFileContent(owner: string, repo: string, path: string) {
    try {
      const response = await this.octokit.repos.getContent({
        owner,
        repo,
        path,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to get file content: ${error.message}`);
    }
  }

  async createIssue(owner: string, repo: string, title: string, body: string) {
    try {
      const response = await this.octokit.issues.create({
        owner,
        repo,
        title,
        body,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to create issue: ${error.message}`);
    }
  }

  async listIssues(owner: string, repo: string) {
    try {
      const response = await this.octokit.issues.listForRepo({
        owner,
        repo,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to list issues: ${error.message}`);
    }
  }
}