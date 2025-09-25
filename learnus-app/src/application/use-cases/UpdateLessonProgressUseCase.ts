import { Result } from '@shared/types/result';
import { ICourseProgressRepository } from '../../domain/repositories/ICourseProgressRepository';
import { ICourseRepository } from '../../domain/repositories/ICourseRepository';
import { UpdateLessonProgressDto, UpdateLessonProgressResponse } from '../dto/UpdateLessonProgressDto';
import { CourseProgress } from '../../domain/entities/CourseProgress';
import { LessonProgress } from '../../domain/entities/LessonProgress';
import { ProgressStatus } from '../../domain/value-objects/ProgressStatus';

export class UpdateLessonProgressUseCase {
  constructor(
    private courseProgressRepository: ICourseProgressRepository,
    private courseRepository: ICourseRepository
  ) {}

  async execute(dto: UpdateLessonProgressDto): Promise<Result<UpdateLessonProgressResponse, Error>> {
    try {
      // 1. Валидация входных данных
      const validationResult = this.validateDto(dto);
      if (validationResult.isFailure) {
        return Result.fail(validationResult.getError());
      }

      // 2. Проверка существования курса
      const courseResult = await this.courseRepository.findById(dto.courseId);
      if (courseResult.isFailure) {
        return Result.fail(new Error('Failed to find course'));
      }

      const course = courseResult.getValue();
      if (!course) {
        return Result.fail(new Error('Course not found'));
      }

      // 3. Получение или создание прогресса курса
      const courseProgressResult = await this.courseProgressRepository.findByCourseIdAndUserId(
        dto.courseId,
        dto.userId
      );

      if (courseProgressResult.isFailure) {
        return Result.fail(new Error('Failed to find course progress'));
      }

      let courseProgress = courseProgressResult.getValue();

      if (!courseProgress) {
        // Создаем новый прогресс курса
        const { v4: uuidv4 } = require('uuid');
        
        const createResult = CourseProgress.create({
          id: uuidv4(),
          courseId: dto.courseId,
          userId: dto.userId,
          lessonProgresses: [],
        });
        
        if (createResult.isFailure) {
          return Result.fail(createResult.getError());
        }

        courseProgress = createResult.getValue();
      }

      // 4. Получение или создание прогресса урока
      let lessonProgress = courseProgress.getLessonProgress(dto.lessonId);

      if (!lessonProgress) {
        // Создаем новый прогресс урока
        const { v4: uuidv4 } = require('uuid');
        
        const createLessonProgressResult = LessonProgress.create({
          id: uuidv4(),
          lessonId: dto.lessonId,
          status: ProgressStatus.create('not_started').getValue(),
        });
        
        if (createLessonProgressResult.isFailure) {
          return Result.fail(createLessonProgressResult.getError());
        }

        lessonProgress = createLessonProgressResult.getValue();

        // Добавляем прогресс урока к курсу
        const addResult = courseProgress.addLessonProgress(lessonProgress);
        if (addResult.isFailure) {
          return Result.fail(addResult.getError());
        }
      }

      // 5. Обновление статуса урока
      const statusResult = ProgressStatus.create(dto.status);
      if (statusResult.isFailure) {
        return Result.fail(statusResult.getError());
      }

      const updateResult = courseProgress.updateLessonProgress(dto.lessonId, statusResult.getValue());
      if (updateResult.isFailure) {
        return Result.fail(updateResult.getError());
      }

      // 6. Сохранение прогресса курса
      const saveResult = await this.courseProgressRepository.save(courseProgress);
      if (saveResult.isFailure) {
        return Result.fail(saveResult.getError());
      }

      // 7. Подготовка ответа
      const response: UpdateLessonProgressResponse = {
        success: true,
        message: 'Lesson progress updated successfully',
        courseProgress: {
          id: courseProgress.id,
          courseId: courseProgress.courseId,
          userId: courseProgress.userId,
          completionPercentage: courseProgress.getCompletionPercentage(),
          overallStatus: courseProgress.getOverallStatus().toString(),
          totalLessons: courseProgress.getTotalLessons(),
          completedLessons: courseProgress.getCompletedLessons(),
          inProgressLessons: courseProgress.getInProgressLessons(),
          notStartedLessons: courseProgress.getNotStartedLessons(),
        },
      };

      return Result.ok(response);
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unknown error occurred'));
    }
  }

  private validateDto(dto: UpdateLessonProgressDto): Result<void, Error> {
    if (!dto.courseId || dto.courseId.trim() === '') {
      return Result.fail(new Error('Course ID is required'));
    }

    if (!dto.lessonId || dto.lessonId.trim() === '') {
      return Result.fail(new Error('Lesson ID is required'));
    }

    if (!dto.userId || dto.userId.trim() === '') {
      return Result.fail(new Error('User ID is required'));
    }

    if (!dto.status || !['not_started', 'in_progress', 'completed'].includes(dto.status)) {
      return Result.fail(new Error('Invalid status. Must be not_started, in_progress, or completed'));
    }

    return Result.ok();
  }
}