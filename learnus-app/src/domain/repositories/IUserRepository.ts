import { User } from '../entities/User';

export interface IUserRepository {
  save(user: User): Promise<void>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  delete(id: string): Promise<void>;
  exists(id: string): Promise<boolean>;
  existsByEmail(email: string): Promise<boolean>;
}