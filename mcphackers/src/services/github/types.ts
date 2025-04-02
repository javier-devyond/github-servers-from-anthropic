export interface IGitHubService {
  initialize(): Promise<void>;
  getRepository(owner: string, repo: string): Promise<any>;
  listRepositories(owner: string): Promise<any>;
  getFileContent(owner: string, repo: string, path: string): Promise<any>;
  createOrUpdateFile(owner: string, repo: string, path: string, content: string, message: string): Promise<any>;
  createIssue(owner: string, repo: string, title: string, body: string): Promise<any>;
  listIssues(owner: string, repo: string): Promise<any>;
  searchCode(query: string): Promise<any>;
  searchRepositories(query: string): Promise<any>;
  createBranch(owner: string, repo: string, branch: string, fromBranch?: string): Promise<any>;
  listBranches(owner: string, repo: string): Promise<any>;
  listCommits(owner: string, repo: string, branch?: string): Promise<any>;
  getCommit(owner: string, repo: string, sha: string): Promise<any>;
} 