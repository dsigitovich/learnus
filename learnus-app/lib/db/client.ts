import Database from 'better-sqlite3';
import path from 'path';
import { User } from '../types';

const DB_PATH = path.join(process.cwd(), 'learnus.db');

let db: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('foreign_keys = ON');
  }
  return db;
}

export function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}

// Утилиты для работы с пользователями
export const userRepository = {
  findByEmail(email: string): User | undefined {
    const db = getDatabase();
    const row = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    return row ? this.mapRowToUser(row) : undefined;
  },

  findByGoogleId(googleId: string): User | undefined {
    const db = getDatabase();
    const row = db.prepare('SELECT * FROM users WHERE google_id = ?').get(googleId);
    return row ? this.mapRowToUser(row) : undefined;
  },

  findById(id: string): User | undefined {
    const db = getDatabase();
    const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    return row ? this.mapRowToUser(row) : undefined;
  },

  create(user: Omit<User, 'createdAt' | 'updatedAt'>): User {
    const db = getDatabase();
    const interests = JSON.stringify(user.interests || []);
    
    db.prepare(`
      INSERT INTO users (id, google_id, email, name, avatar_url, bio, level, interests, email_verified)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      user.id,
      user.googleId,
      user.email,
      user.name,
      user.avatarUrl || null,
      user.bio || null,
      user.level || 'Beginner',
      interests,
      user.emailVerified ? 1 : 0
    );

    return this.findById(user.id)!;
  },

  update(id: string, updates: Partial<User>): User | undefined {
    const db = getDatabase();
    const current = this.findById(id);
    if (!current) return undefined;

    const fields: string[] = [];
    const values: any[] = [];

    if (updates.name !== undefined) {
      fields.push('name = ?');
      values.push(updates.name);
    }
    if (updates.avatarUrl !== undefined) {
      fields.push('avatar_url = ?');
      values.push(updates.avatarUrl);
    }
    if (updates.bio !== undefined) {
      fields.push('bio = ?');
      values.push(updates.bio);
    }
    if (updates.level !== undefined) {
      fields.push('level = ?');
      values.push(updates.level);
    }
    if (updates.interests !== undefined) {
      fields.push('interests = ?');
      values.push(JSON.stringify(updates.interests));
    }

    if (fields.length === 0) return current;

    values.push(id);
    const query = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
    db.prepare(query).run(...values);

    return this.findById(id);
  },

  mapRowToUser(row: any): User {
    return {
      id: row.id,
      googleId: row.google_id,
      email: row.email,
      name: row.name,
      avatarUrl: row.avatar_url,
      bio: row.bio,
      level: row.level as 'Beginner' | 'Intermediate' | 'Advanced',
      interests: row.interests ? JSON.parse(row.interests) : [],
      emailVerified: Boolean(row.email_verified),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  }
};