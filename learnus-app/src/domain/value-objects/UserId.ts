import { ValueObject } from '@shared/types/value-object';
import { Result } from '@shared/types/result';

export class UserId extends ValueObject<string> {
  constructor(value: string) {
    super(value);
    this.validate();
  }

  private validate(): void {
    const value = this.props;
    if (!value || value.trim().length === 0) {
      throw new Error('UserId cannot be empty');
    }
    
    // Простая проверка на минимальную длину
    if (value.trim().length < 3) {
      throw new Error('UserId must be at least 3 characters long');
    }
  }

  public static create(value: string): Result<UserId> {
    try {
      const userId = new UserId(value);
      return Result.ok(userId);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }

  static generate(): UserId {
    const uuid = crypto.randomUUID();
    return new UserId(uuid);
  }

  public toString(): string {
    return this.props;
  }
}