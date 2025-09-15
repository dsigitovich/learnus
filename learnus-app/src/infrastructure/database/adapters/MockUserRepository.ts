import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { User } from '../../../domain/entities/User';
import { UserId } from '../../../domain/value-objects/UserId';
import { Email } from '../../../domain/value-objects/Email';
import { GoogleId } from '../../../domain/value-objects/GoogleId';

export class MockUserRepository implements IUserRepository {
  private users: Map<string, User> = new Map();

  async save(user: User): Promise<void> {
    this.users.set(user.id.value, user);
  }

  async findById(id: UserId): Promise<User | null> {
    return this.users.get(id.value) || null;
  }

  async findByEmail(email: Email): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.email.value === email.value) {
        return user;
      }
    }
    return null;
  }

  async findByGoogleId(googleId: GoogleId): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.googleId?.value === googleId.value) {
        return user;
      }
    }
    return null;
  }

  async delete(id: UserId): Promise<void> {
    this.users.delete(id.value);
  }

  async exists(id: UserId): Promise<boolean> {
    return this.users.has(id.value);
  }
}

