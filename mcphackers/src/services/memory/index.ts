import fs from 'fs';
import path from 'path';

export class MemoryService {
  private storagePath: string;

  constructor() {
    this.storagePath = process.env.MEMORY_STORAGE_PATH || './data/memory';
    // Ensure storage directory exists
    if (!fs.existsSync(this.storagePath)) {
      fs.mkdirSync(this.storagePath, { recursive: true });
    }
  }

  async initialize() {
    // No initialization needed
  }

  async save(key: string, data: any) {
    const filePath = path.join(this.storagePath, `${key}.json`);
    await fs.promises.writeFile(filePath, JSON.stringify(data));
  }

  async load(key: string) {
    const filePath = path.join(this.storagePath, `${key}.json`);
    try {
      const data = await fs.promises.readFile(filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return null;
    }
  }

  async delete(key: string) {
    const filePath = path.join(this.storagePath, `${key}.json`);
    try {
      await fs.promises.unlink(filePath);
    } catch (error) {
      // Ignore if file doesn't exist
    }
  }

  async exists(key: string) {
    const filePath = path.join(this.storagePath, `${key}.json`);
    return fs.existsSync(filePath);
  }

  async shutdown() {
    // No cleanup needed
  }
} 