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

  // Operaciones básicas de repositorio
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

  // Operaciones de archivos
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

  async createOrUpdateFile(owner: string, repo: string, path: string, content: string, message: string) {
    try {
      // Primero intentamos obtener el archivo existente para obtener su SHA
      let sha: string | undefined;
      try {
        const response = await this.octokit.repos.getContent({
          owner,
          repo,
          path,
        });
        if ('sha' in response.data) {
          sha = response.data.sha;
        }
      } catch (error) {
        // Si el archivo no existe, continuamos sin SHA
      }

      // Crear o actualizar el archivo
      const response = await this.octokit.repos.createOrUpdateFileContents({
        owner,
        repo,
        path,
        message,
        content: Buffer.from(content).toString('base64'),
        ...(sha ? { sha } : {}),
      });
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to create/update file: ${error.message}`);
    }
  }

  // Operaciones de issues
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

  // Operaciones de búsqueda
  async searchCode(query: string) {
    try {
      const response = await this.octokit.search.code({
        q: query,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to search code: ${error.message}`);
    }
  }

  async searchRepositories(query: string) {
    try {
      const response = await this.octokit.search.repos({
        q: query,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to search repositories: ${error.message}`);
    }
  }

  // Operaciones de branches
  async createBranch(owner: string, repo: string, branch: string, fromBranch: string = 'main') {
    try {
      // Obtener la referencia del branch base
      const baseRef = await this.octokit.git.getRef({
        owner,
        repo,
        ref: `heads/${fromBranch}`,
      });

      // Crear el nuevo branch
      const response = await this.octokit.git.createRef({
        owner,
        repo,
        ref: `refs/heads/${branch}`,
        sha: baseRef.data.object.sha,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to create branch: ${error.message}`);
    }
  }

  async listBranches(owner: string, repo: string) {
    try {
      const response = await this.octokit.repos.listBranches({
        owner,
        repo,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to list branches: ${error.message}`);
    }
  }

  // Operaciones de commits
  async listCommits(owner: string, repo: string, branch: string = 'main') {
    try {
      const response = await this.octokit.repos.listCommits({
        owner,
        repo,
        sha: branch,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to list commits: ${error.message}`);
    }
  }

  async getCommit(owner: string, repo: string, sha: string) {
    try {
      const response = await this.octokit.repos.getCommit({
        owner,
        repo,
        ref: sha,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to get commit: ${error.message}`);
    }
  }
} 