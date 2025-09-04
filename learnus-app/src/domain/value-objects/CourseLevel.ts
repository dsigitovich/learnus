import { ValueObject } from '@shared/types/value-object';
import { Result } from '@shared/types/result';

export type CourseLevelValue = 'Beginner' | 'Intermediate' | 'Advanced';

interface CourseLevelProps {
  value: CourseLevelValue;
}

export class CourseLevel extends ValueObject<CourseLevelProps> {
  private static readonly validLevels: CourseLevelValue[] = ['Beginner', 'Intermediate', 'Advanced'];
  private static readonly levelHierarchy: Record<CourseLevelValue, number> = {
    'Beginner': 1,
    'Intermediate': 2,
    'Advanced': 3,
  };

  get value(): CourseLevelValue {
    return this.props.value;
  }

  private constructor(props: CourseLevelProps) {
    super(props);
  }

  public static create(value: string): Result<CourseLevel> {
    if (!value || value.trim() === '') {
      return Result.fail(new Error('Course level cannot be empty'));
    }

    if (!this.validLevels.includes(value as CourseLevelValue)) {
      return Result.fail(new Error('Invalid course level. Must be Beginner, Intermediate, or Advanced'));
    }

    return Result.ok(new CourseLevel({ value: value as CourseLevelValue }));
  }

  public canAccess(userLevel: CourseLevel): boolean {
    const userLevelValue = CourseLevel.levelHierarchy[userLevel.value];
    const courseLevelValue = CourseLevel.levelHierarchy[this.value];
    
    return userLevelValue >= courseLevelValue;
  }

  public toString(): string {
    return this.value;
  }
}