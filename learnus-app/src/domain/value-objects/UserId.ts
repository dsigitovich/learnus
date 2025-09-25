import { ValueObject } from '@shared/types/value-object';

export class UserId extends ValueObject<string> {
  constructor(value: string) {
    super(value);
    this.validate();
  }

  private validate(): void {
    if (!this.props || this.props.trim().length === 0) {
      throw new Error('UserId cannot be empty');
    }
    
    // UUID format validation (простая проверка)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(this.props)) {
      throw new Error('UserId must be a valid UUID');
    }
  }

  public get value(): string {
    return this.props;
  }

  public equals(other: UserId): boolean {
    return this.props === other.props;
  }

  static generate(): UserId {
    const uuid = crypto.randomUUID();
    return new UserId(uuid);
  }
}