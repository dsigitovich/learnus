import { Result } from '@shared/types/result';
import { ICourseProgressRepository } from '../../domain/repositories/ICourseProgressRepository';
import { ICourseRepository } from '../../domain/repositories/ICourseRepository';
import { GetCourseProgressDto, GetCourseProgressResponse } from '../dto/GetCourseProgressDto';
import { CourseProgress } from '../../domain/entities/CourseProgress';

export class GetCourseProgressUseCase {
  constructor(
    private courseProgressRepository: ICourseProgressRepository,
    private courseRepository: ICourseRepository
  ) {}

  async execute(dto: GetCourseProgressDto): Promise<Result<GetCourseProgressResponse, Error>> {
    try {
      // 1. Валидация входных данных
      const validationResult = this.validateDto(dto);
      if (validationResult.isFailure()) {
        return Result.fail(validationResult.getError());
      }

      // 2. Проверка существования курса
      const courseResult = await this.courseRepository.findById(dto.courseId);
      if (courseResult.isFailure()) {
        return Result.fail(new Error('Failed to find course'));
      }

      const course = courseResult.getValue();
      if (!course) {
        return Result.fail(new Error('Course not found'));
      }

      // 3. Получение прогресса курса
      const courseProgressResult = await this.courseProgressRepository.findByCourseIdAndUserId(
        dto.courseId,
        dto.userId
      );

      if (courseProgressResult.isFailure()) {
        return Result.fail(new Error('Failed to find course progress'));
      }

      const courseProgress = courseProgressResult.getValue();

      if (!courseProgress) {
        // Возвращаем пустой прогресс, если пользователь еще не начал курс
        const response: GetCourseProgressResponse = {
          success: true,
          courseProgress: {
            id: '',
            courseId: dto.courseId,
            userId: dto.userId,
            completionPercentage: 0,
            overallStatus: 'Не начато',
            totalLessons: 0,
            completedLessons: 0,
            inProgressLessons: 0,
            notStartedLessons: 0,
            lessonProgresses: [],
          },
          message: 'Course progress not found. User has not started this course yet.',
        };

        return Result.ok(response);
      }

      // 4. Подготовка ответа
      const response: GetCourseProgressResponse = {
        success: true,
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
          startedAt: courseProgress.startedAt?.toISOString(),
          completedAt: courseProgress.completedAt?.toISOString(),
          totalDurationInMinutes: courseProgress.getTotalDurationInMinutes(),
          averageLessonDurationInMinutes: courseProgress.getAverageLessonDurationInMinutes(),
          lessonProgresses: courseProgress.lessonProgresses.map(lp => ({
            id: lp.id,
            lessonId: lp.lessonId,
            status: lp.status.toString(),
            startedAt: lp.startedAt?.toISOString(),
            completedAt: lp.completedAt?.toISOString(),
            durationInMinutes: lp.getDurationInMinutes(),
            notes: lp.notes,
          })),
        },
      };

      return Result.ok(response);
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unknown error occurred'));
    }
  }

  private validateDto(dto: GetCourseProgressDto): Result<void, Error> {
    if (!dto.courseId || dto.courseId.trim() === '') {
      return Result.fail(new Error('Course ID is required'));
    }

    if (!dto.userId || dto.userId.trim() === '') {
      return Result.fail(new Error('User ID is required'));
    }

    return Result.ok();
  }
}