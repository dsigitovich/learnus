import { User } from '@/domain/entities/User';
import { Result } from '@/shared/types/result';

export interface UserPersistenceDTO {
  id: string;
  google_id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  bio: string | null;
  level: string;
  interests: string;
  email_verified: number;
  created_at: string;
  updated_at: string;
}

export class UserMapper {
  public static toDomain(raw: UserPersistenceDTO): Result<User> {
    try {
      const userResult = User.create({
        googleId: raw.google_id,
        email: raw.email,
        name: raw.name,
        avatarUrl: raw.avatar_url || undefined,
        level: raw.level as 'Beginner' | 'Intermediate' | 'Advanced'
      }, raw.id);

      if (userResult.isFailure) {
        return Result.fail<User>(userResult.getError());
      }

      const user = userResult.getValue();

      // Устанавливаем дополнительные поля
      if (raw.bio) {
        const bioResult = user.updateBio(raw.bio);
        if (bioResult.isFailure) {
          return Result.fail<User>(bioResult.getError());
        }
      }

      if (raw.interests) {
        try {
          const interests = JSON.parse(raw.interests);
          if (Array.isArray(interests)) {
            const interestsResult = user.updateInterests(interests);
            if (interestsResult.isFailure) {
              return Result.fail<User>(interestsResult.getError());
            }
          }
        } catch (error) {
          // Игнорируем ошибки парсинга JSON
        }
      }

      return Result.ok(user);
    } catch (error) {
      return Result.fail<User>(new Error(`Failed to map user from persistence: ${(error as Error).message}`));
    }
  }

  public static toPersistence(user: User): UserPersistenceDTO {
    return {
      id: user.userId.value,
      google_id: user.googleId.value,
      email: user.email.value,
      name: user.name,
      avatar_url: user.avatarUrl || null,
      bio: user.bio || null,
      level: user.level.value,
      interests: JSON.stringify(user.interests),
      email_verified: user.emailVerified ? 1 : 0,
      created_at: user.createdAt.toISOString(),
      updated_at: user.updatedAt.toISOString()
    };
  }

  public static toDTO(user: User): any {
    return {
      id: user.userId.value,
      googleId: user.googleId.value,
      email: user.email.value,
      name: user.name,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      level: user.level.value,
      interests: user.interests,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString()
    };
  }
}