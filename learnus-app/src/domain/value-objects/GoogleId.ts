import { ValueObject } from '@/shared/types/value-object';

export class GoogleId extends ValueObject<string> {
  constructor(value: string) {
    super(value);
    this.validate();
  }

  private validate(): void {
    if (!this.value || this.value.trim().length === 0) {
      throw new Error('GoogleId cannot be empty');
    }
    
    // Google ID обычно является числовой строкой
    if (!/^\d+$/.test(this.value)) {
      throw new Error('GoogleId must be a numeric string');
    }
  }
}