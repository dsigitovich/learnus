import { Result } from '@shared/types/result';
import { IProgressRepository } from '@domain/repositories/IProgressRepository';
import { Progress } from '@domain/entities/Progress';
import { UserId } from '@domain/value-objects/UserId';
import { LessonProgress, LessonProgressStatus } from '@domain/value-objects/LessonProgress';

export interface TrackLessonProgressRequest {
  userId: string;
  moduleId: string;
  lessonId: string;
  status: LessonProgressStatus;
  timeSpent: number;
  completedAt?: Date;
}

export interface TrackLessonProgressResponse {
  progressId: string;
  lessonProgress: LessonProgress;
}

export class TrackLessonProgressUseCase {
  constructor(
    private progressRepository: IProgressRepository
  ) {}

  async execute(request: TrackLessonProgressRequest): Promise<Result<TrackLessonProgressResponse>> {
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

      // Поиск существующего прогресса
      const existingProgressResult = await this.progressRepository.findByUserAndModule(
        userId, 
        request.moduleId
      );
      if (existingProgressResult.isFailure) {
        return Result.fail(existingProgressResult.getError());
      }

      let progress = existingProgressResult.getValue();

      // Создание или обновление LessonProgress
      const lessonProgressResult = this.createLessonProgress(request);
      if (lessonProgressResult.isFailure) {
        return Result.fail(lessonProgressResult.getError());
      }
      const lessonProgress = lessonProgressResult.getValue();

      if (!progress) {
        // Создаем новый прогресс модуля
        const newProgressResult = Progress.create({
          userId,
          moduleId: request.moduleId,
          lessonProgresses: [lessonProgress],
          startedAt: new Date(),
        });
        
        if (newProgressResult.isFailure) {
          return Result.fail(newProgressResult.getError());
        }
        
        progress = newProgressResult.getValue();
      } else {
        // Обновляем существующий прогресс
        const existingLessonProgress = progress.getLessonProgress(request.lessonId);
        
        if (existingLessonProgress) {
          // Обновляем существующий урок
          const updateResult = progress.updateLessonProgress(lessonProgress);
          if (updateResult.isFailure) {
            return Result.fail(updateResult.getError());
          }
        } else {
          // Добавляем новый урок
          const addResult = progress.addLessonProgress(lessonProgress);
          if (addResult.isFailure) {
            return Result.fail(addResult.getError());
          }
        }
      }

      // Сохраняем прогресс
      const saveResult = await this.progressRepository.save(progress);
      if (saveResult.isFailure) {
        return Result.fail(saveResult.getError());
      }

      return Result.ok({
        progressId: progress.id,
        lessonProgress
      });

    } catch (error) {
      return Result.fail(error as Error);
    }
  }

  private validateRequest(request: TrackLessonProgressRequest): Result<void> {
    if (!request.userId || request.userId.trim() === '') {
      return Result.fail(new Error('UserId cannot be empty'));
    }

    if (!request.moduleId || request.moduleId.trim() === '') {
      return Result.fail(new Error('Module ID cannot be empty'));
    }

    if (!request.lessonId || request.lessonId.trim() === '') {
      return Result.fail(new Error('Lesson ID cannot be empty'));
    }

    if (request.timeSpent < 0) {
      return Result.fail(new Error('Time spent cannot be negative'));
    }

    if (!Object.values(LessonProgressStatus).includes(request.status)) {
      return Result.fail(new Error('Invalid lesson progress status'));
    }

    if (request.status === LessonProgressStatus.COMPLETED && !request.completedAt) {
      request.completedAt = new Date();
    }

    return Result.ok();
  }

  private createLessonProgress(request: TrackLessonProgressRequest): Result<LessonProgress> {
    const now = new Date();
    
    return LessonProgress.create({
      lessonId: request.lessonId,
      status: request.status,
      startedAt: now,
      completedAt: request.completedAt,
      timeSpent: request.timeSpent,
      attempts: 1,
      lastAttemptAt: now,
    });
  }
}