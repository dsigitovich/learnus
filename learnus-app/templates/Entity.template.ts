import { Entity } from '@shared/types/entity';
import { Result } from '@shared/types/result';

interface {{ENTITY_NAME}}Props {
  // Define your entity properties here
}

interface {{ENTITY_NAME}}CreateProps {
  // Define creation properties here
}

export class {{ENTITY_NAME}} extends Entity<{{ENTITY_NAME}}Props> {
  // Getters
  // get property(): Type { return this.props.property; }

  private constructor(props: {{ENTITY_NAME}}Props, id?: string) {
    super(props, id);
  }

  public static create(props: {{ENTITY_NAME}}CreateProps, id?: string): Result<{{ENTITY_NAME}}> {
    try {
      // Validation logic here
      
      const entity = new {{ENTITY_NAME}}(
        {
          // Map props
        },
        id
      );

      return Result.ok(entity);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }

  // Business methods here
}
