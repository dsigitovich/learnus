import Database from 'better-sqlite3';
import { injectable } from 'inversify';

@injectable()
export class DatabaseService {
  private db: Database.Database;

  constructor() {
    const dbPath = process.env.DATABASE_PATH || './socrademy.db';
    this.db = new Database(dbPath);
  }

  getDatabase(): Database.Database {
    return this.db;
  }

  close(): void {
    this.db.close();
  }
}
