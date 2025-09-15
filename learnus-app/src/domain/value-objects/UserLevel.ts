import { ValueObject } from '../../shared/types/value-object';

export type UserLevelType = 'Beginner' | 'Intermediate' | 'Advanced';

export class UserLevel extends ValueObject<UserLevelType> {
  private static readonly LEVELS: UserLevelType[] = ['Beginner', 'Intermediate', 'Advanced'];
  
  constructor(value: UserLevelType) {
    super(value);
    this.validate();
  }

  get value(): UserLevelType {
    return this.props;
  }

  private validate(): void {
    if (!UserLevel.LEVELS.includes(this.props)) {
      throw new Error(`Invalid user level: ${this.props}`);
    }
  }

  canAccessCourseLevel(courseLevel: UserLevel): boolean {
    const userIndex = UserLevel.LEVELS.indexOf(this.props);
    const courseIndex = UserLevel.LEVELS.indexOf(courseLevel.props);
    return userIndex >= courseIndex;
  }

  static createBeginner(): UserLevel {
    return new UserLevel('Beginner');
  }

  static createIntermediate(): UserLevel {
    return new UserLevel('Intermediate');
  }

  static createAdvanced(): UserLevel {
    return new UserLevel('Advanced');
  }
}