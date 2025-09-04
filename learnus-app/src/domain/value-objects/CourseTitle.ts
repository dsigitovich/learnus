import { ValueObject } from '@shared/types/value-object';
import { Result } from '@shared/types/result';

interface CourseTitleProps {
  value: string;
}

export class CourseTitle extends ValueObject<CourseTitleProps> {
  private static readonly MIN_LENGTH = 3;
  private static readonly MAX_LENGTH = 200;

  get value(): string {
    return this.props.value;
  }

  private constructor(props: CourseTitleProps) {
    super(props);
  }

  public static create(value: string): Result<CourseTitle> {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
      return Result.fail(new Error('Course title cannot be empty'));
    }

    if (trimmedValue.length < this.MIN_LENGTH || trimmedValue.length > this.MAX_LENGTH) {
      return Result.fail(
        new Error(`Course title must be between ${this.MIN_LENGTH} and ${this.MAX_LENGTH} characters`)
      );
    }

    return Result.ok(new CourseTitle({ value: trimmedValue }));
  }

  public toString(): string {
    return this.value;
  }
}