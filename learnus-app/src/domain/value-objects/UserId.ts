import { ValueObject } from '@/shared/types/value-object';

export class UserId extends ValueObject<string> {
  constructor(value: string) {
    super(value);
    this.validate();
  }

  private validate(): void {
    if (!this.value || this.value.trim().length === 0) {
      throw new Error('UserId cannot be empty');
    }
    
    // UUID format validation (простая проверка)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(this.value)) {
      throw new Error('UserId must be a valid UUID');
    }
  }

  static generate(): UserId {
    const uuid = crypto.randomUUID();
    return new UserId(uuid);
  }
}