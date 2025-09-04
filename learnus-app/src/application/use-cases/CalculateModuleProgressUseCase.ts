import { Result } from '@shared/types/result';
import { IProgressRepository } from '@domain/repositories/IProgressRepository';
import { UserId } from '@domain/value-objects/UserId';
import { ModuleProgress } from '@domain/value-objects/ModuleProgress';

export interface CalculateModuleProgressRequest {
  userId: string;
  moduleId: string;
  totalLessons: number;
}

export interface CalculateModuleProgressResponse {
  moduleId: string;
  progress: ModuleProgress;
  estimatedTimeRemaining: string;
  recommendedNextAction: 'start_next_lesson' | 'continue_current_lesson' | 'review_completed' | 'module_completed';
  nextLessonId?: string;
  currentLessonId?: string;
}

export class CalculateModuleProgressUseCase {
  constructor(
    private progressRepository: IProgressRepository
  ) {}

  async execute(request: CalculateModuleProgressRequest): Promise<Result<CalculateModuleProgressResponse | null>> {
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

      // Поиск прогресса пользователя по модулю
      const progressResult = await this.progressRepository.findByUserAndModule(userId, request.moduleId);
      if (progressResult.isFailure) {
        return Result.fail(progressResult.getError());
      }

      const progress = progressResult.getValue();
      if (!progress) {
        return Result.ok(null);
      }

      // Расчет прогресса модуля
      const moduleProgress = progress.calculateModuleProgress(request.totalLessons);

      // Расчет оставшегося времени
      const averageTimePerLesson = progress.getAverageTimePerLesson();
      const estimatedTimeRemaining = moduleProgress.getEstimatedTimeRemaining(averageTimePerLesson);

      // Определение рекомендуемого действия
      const recommendedAction = this.getRecommendedAction(progress, request.totalLessons);
      
      // Определение текущего и следующего урока
      const currentLesson = progress.getCurrentLesson();
      const nextLessonId = progress.getNextLessonToStart(this.generateLessonIds(request.totalLessons));

      const response: CalculateModuleProgressResponse = {
        moduleId: request.moduleId,
        progress: moduleProgress,
        estimatedTimeRemaining,
        recommendedNextAction: recommendedAction,
        currentLessonId: currentLesson?.lessonId,
        nextLessonId,
      };

      return Result.ok(response);

    } catch (error) {
      return Result.fail(error as Error);
    }
  }

  private validateRequest(request: CalculateModuleProgressRequest): Result<void> {
    if (!request.userId || request.userId.trim() === '') {
      return Result.fail(new Error('UserId cannot be empty'));
    }

    if (!request.moduleId || request.moduleId.trim() === '') {
      return Result.fail(new Error('Module ID cannot be empty'));
    }

    if (request.totalLessons <= 0) {
      return Result.fail(new Error('Total lessons must be greater than 0'));
    }

    return Result.ok();
  }

  private getRecommendedAction(
    progress: any, 
    totalLessons: number
  ): 'start_next_lesson' | 'continue_current_lesson' | 'review_completed' | 'module_completed' {
    
    if (progress.isModuleCompleted(totalLessons)) {
      return 'module_completed';
    }

    const currentLesson = progress.getCurrentLesson();
    if (currentLesson) {
      return 'continue_current_lesson';
    }

    const completedCount = progress.getCompletedLessonsCount();
    const inProgressCount = progress.getInProgressLessonsCount();
    
    if (completedCount + inProgressCount < totalLessons) {
      return 'start_next_lesson';
    }

    return 'review_completed';
  }

  private generateLessonIds(totalLessons: number): string[] {
    // В реальном приложении это должно приходить из модуля/курса
    const lessonIds: string[] = [];
    for (let i = 1; i <= totalLessons; i++) {
      lessonIds.push(`lesson-${i}`);
    }
    return lessonIds;
  }
}