import { injectable, inject } from 'inversify';
import { Result } from '@shared/types/result';
import { TYPES } from '@shared/container/types';
import type { ICourseRepository } from '@domain/repositories/ICourseRepository';
import type { IAIService } from '@application/interfaces/IAIService';
import type { IEventBus } from '@application/interfaces/IEventBus';
import { CreateCourseDto, CreateCourseResponse, CreateCourseSchema } from '@application/dto/CreateCourseDto';
import { CourseAggregate } from '@domain/aggregates/CourseAggregate';
import { CourseCreatedEvent } from '@domain/events/CourseCreatedEvent';

@injectable()
export class CreateCourseUseCase {
  constructor(
    @inject(TYPES.ICourseRepository) private courseRepository: ICourseRepository,
    @inject(TYPES.IAIService) private aiService: IAIService,
    @inject(TYPES.IEventBus) private eventBus: IEventBus
  ) {}

  async execute(request: CreateCourseDto): Promise<Result<CreateCourseResponse>> {
    try {
      // 1. Validate request
      const validation = CreateCourseSchema.safeParse(request);
      if (!validation.success) {
        return Result.fail(new Error(validation.error.errors[0]?.message || 'Invalid request'));
      }

      // 2. Generate course structure using AI
      let courseStructure;
      try {
        courseStructure = await this.aiService.generateCourse(
          request.prompt,
          request.level
        );
      } catch (error) {
        return Result.fail(
          new Error(`Failed to generate course: ${error instanceof Error ? error.message : 'Unknown error'}`)
        );
      }

      // 3. Create course aggregate
      const courseResult = CourseAggregate.create({
        title: courseStructure.title,
        description: courseStructure.description,
        level: courseStructure.level,
        modules: courseStructure.modules,
      });

      if (courseResult.isFailure) {
        return Result.fail(courseResult.getError());
      }

      const course = courseResult.getValue();

      // 4. Save to repository
      try {
        await this.courseRepository.save(course);
      } catch (error) {
        return Result.fail(
          new Error(`Failed to save course: ${error instanceof Error ? error.message : 'Unknown error'}`)
        );
      }

      // 5. Publish domain event
      const event = new CourseCreatedEvent(
        course.id,
        course.title.value,
        course.level.value
      );
      await this.eventBus.publish(event);

      // 6. Return response
      const response: CreateCourseResponse = {
        courseId: course.id,
        title: course.title.value,
        description: course.description,
        level: course.level.value,
        totalModules: course.modules.length,
        totalLessons: course.getTotalLessons(),
      };

      return Result.ok(response);
    } catch (error) {
      return Result.fail(
        new Error(`Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      );
    }
  }
}