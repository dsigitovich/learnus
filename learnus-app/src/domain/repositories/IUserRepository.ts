import { User } from '../entities/User';
import { Result } from '@shared/types/result';

export interface IUserRepository {
  save(user: User): Promise<Result<void>>;
  findById(id: string): Promise<Result<User | null>>;
  findByEmail(email: string): Promise<Result<User | null>>;
  findByGoogleId(googleId: string): Promise<Result<User | null>>;
  update(user: User): Promise<Result<void>>;
  delete(id: string): Promise<Result<void>>;
  exists(id: string): Promise<Result<boolean>>;
  existsByEmail(email: string): Promise<Result<boolean>>;
  existsByGoogleId(googleId: string): Promise<Result<boolean>>;
}