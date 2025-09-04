import { Entity } from '@shared/types/entity';
import { Result } from '@shared/types/result';
import { Email } from '../value-objects/Email';
import { CourseLevel } from '../value-objects/CourseLevel';

interface UserProps {
  email: Email;
  name: string;
  level: CourseLevel;
  createdAt: Date;
  updatedAt: Date;
}

interface UserCreateProps {
  email: string;
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
}

export class User extends Entity<UserProps> {
  get email(): Email {
    return this.props.email;
  }

  get name(): string {
    return this.props.name;
  }

  get level(): CourseLevel {
    return this.props.level;
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
    // Validate email
    const emailResult = Email.create(props.email);
    if (emailResult.isFailure) {
      return Result.fail(new Error(`Invalid email: ${emailResult.getError().message}`));
    }

    // Validate name
    if (!props.name || props.name.trim() === '') {
      return Result.fail(new Error('Name cannot be empty'));
    }

    // Validate level
    const levelResult = CourseLevel.create(props.level);
    if (levelResult.isFailure) {
      return Result.fail(new Error(`Invalid level: ${levelResult.getError().message}`));
    }

    const now = new Date();
    const user = new User(
      {
        email: emailResult.getValue(),
        name: props.name.trim(),
        level: levelResult.getValue(),
        createdAt: now,
        updatedAt: now,
      },
      id
    );

    return Result.ok(user);
  }

  public updateLevel(newLevel: CourseLevel): void {
    this.props.level = newLevel;
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
    return courseLevel.canAccess(this.level);
  }
}