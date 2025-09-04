import { Result } from '@shared/types/result';
import { IProgressRepository, UserStatistics } from '@domain/repositories/IProgressRepository';
import { Progress } from '@domain/entities/Progress';
import { UserId } from '@domain/value-objects/UserId';
import { ModuleProgress } from '@domain/value-objects/ModuleProgress';

export interface GetUserProgressRequest {
  userId: string;
  moduleId?: string; // Если указан, возвращаем прогресс только по этому модулю
  totalLessonsInModule?: number; // Нужно для расчета прогресса модуля
}

export interface ModuleProgressSummary {
  moduleId: string;
  progress: ModuleProgress;
  startedAt: Date;
  lastAccessedAt?: Date;
  completedAt?: Date;
  currentLessonId?: string;
  nextLessonId?: string;
}

export interface GetUserProgressResponse {
  userId: string;
  moduleProgresses: ModuleProgressSummary[];
  statistics: UserStatistics;
  overallProgress: {
    totalModules: number;
    completedModules: number;
    inProgressModules: number;
    totalTimeSpent: number;
    averageCompletionRate: number;
  };
}

export class GetUserProgressUseCase {
  constructor(
    private progressRepository: IProgressRepository
  ) {}

  async execute(request: GetUserProgressRequest): Promise<Result<GetUserProgressResponse>> {
    try {
      // Валидация входных данных
      const validationResult = this.validateRequest(request);
      if (validationResult.isFailure) {
        return Result.fail(validationResult.getError());
      }

      // Создание UserId
      const userIdResult = UserId.create(request.userId);
      if (userIdResult.isFailure) {
        return Result.fail(userIdResult.getError());
      }
      const userId = userIdResult.getValue();

      // Получение прогресса пользователя
      let progresses: Progress[];
      if (request.moduleId) {
        const progressResult = await this.progressRepository.findByUserAndModule(userId, request.moduleId);
        if (progressResult.isFailure) {
          return Result.fail(progressResult.getError());
        }
        progresses = progressResult.getValue() ? [progressResult.getValue()!] : [];
      } else {
        const progressesResult = await this.progressRepository.findByUser(userId);
        if (progressesResult.isFailure) {
          return Result.fail(progressesResult.getError());
        }
        progresses = progressesResult.getValue();
      }

      // Получение статистики пользователя
      const statisticsResult = await this.progressRepository.getUserStatistics(userId);
      if (statisticsResult.isFailure) {
        return Result.fail(statisticsResult.getError());
      }
      const statistics = statisticsResult.getValue();

      // Создание модульного прогресса
      const moduleProgresses: ModuleProgressSummary[] = [];
      let totalTimeSpent = 0;
      let completedModules = 0;

      for (const progress of progresses) {
        const totalLessons = request.totalLessonsInModule || this.estimateTotalLessons(progress);
        const moduleProgress = progress.calculateModuleProgress(totalLessons);
        
        const currentLesson = progress.getCurrentLesson();
        const nextLessonId = this.getNextLessonId(progress, totalLessons);
        
        moduleProgresses.push({
          moduleId: progress.moduleId,
          progress: moduleProgress,
          startedAt: progress.startedAt,
          lastAccessedAt: progress.lastAccessedAt,
          completedAt: progress.completedAt,
          currentLessonId: currentLesson?.lessonId,
          nextLessonId,
        });

        totalTimeSpent += progress.getTotalTimeSpent();
        if (progress.isCompleted()) {
          completedModules++;
        }
      }

      // Расчет общего прогресса
      const totalModules = progresses.length;
      const inProgressModules = totalModules - completedModules;
      const averageCompletionRate = totalModules > 0 
        ? (completedModules / totalModules) * 100 
        : 0;

      const response: GetUserProgressResponse = {
        userId: request.userId,
        moduleProgresses,
        statistics,
        overallProgress: {
          totalModules,
          completedModules,
          inProgressModules,
          totalTimeSpent,
          averageCompletionRate,
        },
      };

      return Result.ok(response);

    } catch (error) {
      return Result.fail(error as Error);
    }
  }

  private validateRequest(request: GetUserProgressRequest): Result<void> {
    if (!request.userId || request.userId.trim() === '') {
      return Result.fail(new Error('UserId cannot be empty'));
    }

    if (request.totalLessonsInModule !== undefined && request.totalLessonsInModule <= 0) {
      return Result.fail(new Error('Total lessons in module must be greater than 0'));
    }

    return Result.ok();
  }

  private estimateTotalLessons(progress: Progress): number {
    // Простая эвристика: если есть прогресс по урокам, 
    // предполагаем, что общее количество уроков больше на 20%
    const currentLessonsCount = progress.lessonProgresses.length;
    if (currentLessonsCount === 0) return 1;
    
    // Если модуль завершен, количество уроков известно точно
    if (progress.isCompleted()) {
      return currentLessonsCount;
    }
    
    // Иначе предполагаем, что это примерно 80% от общего количества
    return Math.max(currentLessonsCount, Math.ceil(currentLessonsCount * 1.25));
  }

  private getNextLessonId(progress: Progress, totalLessons: number): string | undefined {
    // Простая реализация - генерируем ID следующего урока
    // В реальном приложении это должно приходить из модуля/курса
    const completedCount = progress.getCompletedLessonsCount();
    const inProgressCount = progress.getInProgressLessonsCount();
    const nextLessonNumber = completedCount + inProgressCount + 1;
    
    if (nextLessonNumber <= totalLessons) {
      return `lesson-${nextLessonNumber}`;
    }
    
    return undefined;
  }
}