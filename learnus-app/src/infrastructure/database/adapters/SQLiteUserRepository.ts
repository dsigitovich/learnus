import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { User } from '../../../domain/entities/User';
import { UserId } from '../../../domain/value-objects/UserId';
import { UserRepository } from '../UserRepository';

export class SQLiteUserRepository extends UserRepository implements IUserRepository {
  // Наследуем всю функциональность от основного UserRepository
}

