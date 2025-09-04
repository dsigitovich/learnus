import { Entity } from '@shared/types/entity';
import { Result } from '@shared/types/result';
import { Email } from '../value-objects/Email';
import { CourseLevel } from '../value-objects/CourseLevel';
import { GoogleId } from '../value-objects/GoogleId';
import { UserId } from '../value-objects/UserId';
import { UserLevel, UserLevelType } from '../value-objects/UserLevel';

interface UserProps {
  userId: UserId;
  googleId: GoogleId;
  email: Email;
  name: string;
  avatarUrl?: string;
  bio?: string;
  level: UserLevel;
  interests: string[];
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface UserCreateProps {
  googleId: string;
  email: string;
  name: string;
  avatarUrl?: string;
  level?: UserLevelType;
}

interface UserCreateFromAuthProps {
  googleId: string;
  email: string;
  name: string;
  avatarUrl?: string;
  emailVerified?: boolean;
}

export class User extends Entity<UserProps> {
  get userId(): UserId {
    return this.props.userId;
  }

  get googleId(): GoogleId {
    return this.props.googleId;
  }

  get email(): Email {
    return this.props.email;
  }

  get name(): string {
    return this.props.name;
  }

  get avatarUrl(): string | undefined {
    return this.props.avatarUrl;
  }

  get bio(): string | undefined {
    return this.props.bio;
  }

  get level(): UserLevel {
    return this.props.level;
  }

  get interests(): string[] {
    return [...this.props.interests];
  }

  get emailVerified(): boolean {
    return this.props.emailVerified;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  private constructor(props: UserProps, id?: string) {
    super(props, id);
  }

  public static create(props: UserCreateProps, id?: string): Result<User> {
    try {
      // Generate or use provided user ID
      const userId = id ? new UserId(id) : UserId.generate();
      
      // Validate Google ID
      const googleId = new GoogleId(props.googleId);
      
      // Validate email
      const emailResult = Email.create(props.email);
      if (emailResult.isFailure) {
        return Result.fail(new Error(`Invalid email: ${emailResult.getError().message}`));
      }

      // Validate name
      if (!props.name || props.name.trim() === '') {
        return Result.fail(new Error('Name cannot be empty'));
      }

      // Create level (default to Beginner)
      const level = new UserLevel(props.level || 'Beginner');

      const now = new Date();
      const user = new User(
        {
          userId,
          googleId,
          email: emailResult.getValue(),
          name: props.name.trim(),
          avatarUrl: props.avatarUrl,
          bio: undefined,
          level,
          interests: [],
          emailVerified: true, // Google accounts are pre-verified
          createdAt: now,
          updatedAt: now,
        },
        userId.value
      );

      return Result.ok(user);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }

  public static createFromGoogleAuth(props: UserCreateFromAuthProps): Result<User> {
    return User.create({
      googleId: props.googleId,
      email: props.email,
      name: props.name,
      avatarUrl: props.avatarUrl,
      level: 'Beginner'
    });
  }

  public updateLevel(newLevel: UserLevel): void {
    this.props.level = newLevel;
    this.props.updatedAt = new Date();
  }

  public updateBio(bio: string): Result<void> {
    if (bio.length > 500) {
      return Result.fail(new Error('Bio cannot exceed 500 characters'));
    }
    this.props.bio = bio;
    this.props.updatedAt = new Date();
    return Result.ok();
  }

  public updateInterests(interests: string[]): Result<void> {
    if (interests.length > 10) {
      return Result.fail(new Error('Cannot have more than 10 interests'));
    }
    this.props.interests = [...interests];
    this.props.updatedAt = new Date();
    return Result.ok();
  }

  public updateAvatar(avatarUrl: string): void {
    this.props.avatarUrl = avatarUrl;
    this.props.updatedAt = new Date();
  }

  public updateName(newName: string): Result<void> {
    if (!newName || newName.trim() === '') {
      return Result.fail(new Error('Name cannot be empty'));
    }

    this.props.name = newName.trim();
    this.props.updatedAt = new Date();
    return Result.ok();
  }

  public canAccessCourse(courseLevel: CourseLevel): boolean {
    // Преобразуем CourseLevel в UserLevel для сравнения
    const courseLevelAsUserLevel = new UserLevel(courseLevel.value as UserLevelType);
    return this.level.canAccessCourseLevel(courseLevelAsUserLevel);
  }
}