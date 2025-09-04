import { ValueObject } from '@shared/types/value-object';
import { Result } from '@shared/types/result';

interface EmailProps {
  value: string;
}

export class Email extends ValueObject<EmailProps> {
  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  get value(): string {
    return this.props.value;
  }

  private constructor(props: EmailProps) {
    super(props);
  }

  public static create(value: string): Result<Email> {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
      return Result.fail(new Error('Email cannot be empty'));
    }

    if (!this.EMAIL_REGEX.test(trimmedValue)) {
      return Result.fail(new Error('Invalid email format'));
    }

    return Result.ok(new Email({ value: trimmedValue.toLowerCase() }));
  }

  public toString(): string {
    return this.value;
  }
}