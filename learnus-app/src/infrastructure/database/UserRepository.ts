import { IUserRepository } from '@/domain/repositories/IUserRepository';
import { User } from '@/domain/entities/User';
import { Result } from '@/shared/types/result';
import { UserMapper, UserPersistenceDTO } from './mappers/UserMapper';
import Database from 'better-sqlite3';

export class UserRepository implements IUserRepository {
  constructor(private db: Database.Database) {}

  async save(user: User): Promise<Result<void>> {
    try {
      const persistenceDTO = UserMapper.toPersistence(user);
      
      const stmt = this.db.prepare(`
        INSERT INTO users (
          id, google_id, email, name, avatar_url, bio, 
          level, interests, email_verified, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        persistenceDTO.id,
        persistenceDTO.google_id,
        persistenceDTO.email,
        persistenceDTO.name,
        persistenceDTO.avatar_url,
        persistenceDTO.bio,
        persistenceDTO.level,
        persistenceDTO.interests,
        persistenceDTO.email_verified,
        persistenceDTO.created_at,
        persistenceDTO.updated_at
      );

      return Result.ok<void>();
    } catch (error) {
      return Result.fail<void>(new Error(`Failed to save user: ${(error as Error).message}`));
    }
  }

  async update(user: User): Promise<Result<void>> {
    try {
      const persistenceDTO = UserMapper.toPersistence(user);
      
      const stmt = this.db.prepare(`
        UPDATE users 
        SET name = ?, avatar_url = ?, bio = ?, level = ?, 
            interests = ?, updated_at = ?
        WHERE id = ?
      `);

      stmt.run(
        persistenceDTO.name,
        persistenceDTO.avatar_url,
        persistenceDTO.bio,
        persistenceDTO.level,
        persistenceDTO.interests,
        persistenceDTO.updated_at,
        persistenceDTO.id
      );

      return Result.ok<void>();
    } catch (error) {
      return Result.fail<void>(new Error(`Failed to update user: ${(error as Error).message}`));
    }
  }

  async findById(id: string): Promise<Result<User | null>> {
    try {
      const stmt = this.db.prepare('SELECT * FROM users WHERE id = ?');
      const row = stmt.get(id) as any;

      if (!row) {
        return Result.ok<User | null>(null);
      }

      return this.mapToUser(row);
    } catch (error) {
      return Result.fail<User | null>(new Error(`Failed to find user by id: ${(error as Error).message}`));
    }
  }

  async findByEmail(email: string): Promise<Result<User | null>> {
    try {
      const stmt = this.db.prepare('SELECT * FROM users WHERE email = ?');
      const row = stmt.get(email) as any;

      if (!row) {
        return Result.ok<User | null>(null);
      }

      return this.mapToUser(row);
    } catch (error) {
      return Result.fail<User | null>(new Error(`Failed to find user by email: ${(error as Error).message}`));
    }
  }

  async findByGoogleId(googleId: string): Promise<Result<User | null>> {
    try {
      const stmt = this.db.prepare('SELECT * FROM users WHERE google_id = ?');
      const row = stmt.get(googleId) as any;

      if (!row) {
        return Result.ok<User | null>(null);
      }

      return this.mapToUser(row);
    } catch (error) {
      return Result.fail<User | null>(new Error(`Failed to find user by Google ID: ${(error as Error).message}`));
    }
  }

  async delete(id: string): Promise<Result<void>> {
    try {
      const stmt = this.db.prepare('DELETE FROM users WHERE id = ?');
      stmt.run(id);
      return Result.ok<void>();
    } catch (error) {
      return Result.fail<void>(new Error(`Failed to delete user: ${(error as Error).message}`));
    }
  }

  async exists(id: string): Promise<Result<boolean>> {
    try {
      const stmt = this.db.prepare('SELECT 1 FROM users WHERE id = ? LIMIT 1');
      const exists = stmt.get(id) !== undefined;
      return Result.ok<boolean>(exists);
    } catch (error) {
      return Result.fail<boolean>(new Error(`Failed to check user existence: ${(error as Error).message}`));
    }
  }

  async existsByEmail(email: string): Promise<Result<boolean>> {
    try {
      const stmt = this.db.prepare('SELECT 1 FROM users WHERE email = ? LIMIT 1');
      const exists = stmt.get(email) !== undefined;
      return Result.ok<boolean>(exists);
    } catch (error) {
      return Result.fail<boolean>(new Error(`Failed to check email existence: ${(error as Error).message}`));
    }
  }

  async existsByGoogleId(googleId: string): Promise<Result<boolean>> {
    try {
      const stmt = this.db.prepare('SELECT 1 FROM users WHERE google_id = ? LIMIT 1');
      const exists = stmt.get(googleId) !== undefined;
      return Result.ok<boolean>(exists);
    } catch (error) {
      return Result.fail<boolean>(new Error(`Failed to check Google ID existence: ${(error as Error).message}`));
    }
  }

  private mapToUser(row: any): Result<User | null> {
    if (!row) {
      return Result.ok<User | null>(null);
    }
    
    const persistenceDTO: UserPersistenceDTO = row as UserPersistenceDTO;
    const userResult = UserMapper.toDomain(persistenceDTO);
    
    if (userResult.isFailure) {
      return Result.fail<User | null>(userResult.getError());
    }
    
    return Result.ok<User | null>(userResult.getValue());
  }
}