import { Result } from '@shared/types/result';
import { {{REPOSITORY_INTERFACE}} } from '../../domain/repositories/{{REPOSITORY_INTERFACE}}';
import { {{DTO_INTERFACE}} } from '../dto/{{DTO_INTERFACE}}';

export class {{USE_CASE_NAME}} {
  constructor(
    private {{repositoryName}}: {{REPOSITORY_INTERFACE}}
  ) {}

  async execute(dto: {{DTO_INTERFACE}}): Promise<Result<{{RESPONSE_TYPE}}, Error>> {
    try {
      // 1. Валидация входных данных
      const validationResult = this.validateDto(dto);
      if (validationResult.isFailure) {
        return Result.fail(validationResult.getError());
      }

      // 2. Бизнес-логика здесь
      
      // 3. Возврат результата
      return Result.ok(result);
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unknown error occurred'));
    }
  }

  private validateDto(dto: {{DTO_INTERFACE}}): Result<void, Error> {
    // Add validation logic here
    return Result.ok();
  }
}
