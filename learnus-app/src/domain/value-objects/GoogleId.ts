import { ValueObject } from '@shared/types/value-object';

export class GoogleId extends ValueObject<string> {
  constructor(value: string) {
    super(value);
    this.validate();
  }

  private validate(): void {
    if (!this.props || this.props.trim().length === 0) {
      throw new Error('GoogleId cannot be empty');
    }
    
    // Google ID обычно является числовой строкой
    if (!/^\d+$/.test(this.props)) {
      throw new Error('GoogleId must be a numeric string');
    }
  }

  public get value(): string {
    return this.props;
  }

  public equals(other: GoogleId): boolean {
    return this.props === other.props;
  }
}