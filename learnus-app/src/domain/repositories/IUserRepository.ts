import { User } from '../entities/User';
import { Result } from '@shared/types/result';

export interface IUserRepository {
  save(_user: User): Promise<Result<void>>;
  findById(_id: string): Promise<Result<User | null>>;
  findByEmail(_email: string): Promise<Result<User | null>>;
  delete(_id: string): Promise<Result<void>>;
  exists(_id: string): Promise<Result<boolean>>;
}