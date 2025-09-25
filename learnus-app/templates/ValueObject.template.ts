import { ValueObject } from '@shared/types/value-object';

export class {{CLASS_NAME}} extends ValueObject<{{TYPE}}> {
  constructor(value: {{TYPE}}) {
    super(value);
    this.validate();
  }

  private validate(): void {
    if (!this.props || this.props.trim().length === 0) {
      throw new Error('{{CLASS_NAME}} cannot be empty');
    }
    
    // Add your validation logic here
  }

  public get value(): {{TYPE}} {
    return this.props;
  }

  public equals(other: {{CLASS_NAME}}): boolean {
    return this.props === other.props;
  }
}
