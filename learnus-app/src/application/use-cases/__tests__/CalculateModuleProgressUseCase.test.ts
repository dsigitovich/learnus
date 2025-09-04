import { CalculateModuleProgressUseCase } from '../CalculateModuleProgressUseCase';
import { IProgressRepository } from '@domain/repositories/IProgressRepository';
import { Progress } from '@domain/entities/Progress';
import { UserId } from '@domain/value-objects/UserId';
import { LessonProgress, LessonProgressStatus } from '@domain/value-objects/LessonProgress';
import { Result } from '@shared/types/result';

// Mock repository
class MockProgressRepository implements IProgressRepository {
  private progresses: Map<string, Progress> = new Map();

  async save(progress: Progress): Promise<Result<void>> {
    this.progresses.set(`${progress.userId.toString()}-${progress.moduleId}`, progress);
    return Result.ok();
  }

  async findByUserAndModule(userId: UserId, moduleId: string): Promise<Result<Progress | null>> {
    const progress = this.progresses.get(`${userId.toString()}-${moduleId}`);
    return Result.ok(progress || null);
  }

  async findByUser(userId: UserId): Promise<Result<Progress[]>> {
    const userProgresses = Array.from(this.progresses.values())
      .filter(p => p.userId.toString() === userId.toString());
    return Result.ok(userProgresses);
  }

  async findById(progressId: string): Promise<Result<Progress | null>> {
    return Result.ok(null);
  }

  async delete(progressId: string): Promise<Result<void>> {
    return Result.ok();
  }

  async getUserStatistics(): Promise<Result<any>> {
    return Result.ok({});
  }

  async getTopUsers(): Promise<Result<any[]>> {
    return Result.ok([]);
  }

  // Helper для тестов
  setMockProgress(progress: Progress) {
    this.progresses.set(`${progress.userId.toString()}-${progress.moduleId}`, progress);
  }
}

describe('CalculateModuleProgressUseCase', () => {
  let useCase: CalculateModuleProgressUseCase;
  let mockRepository: MockProgressRepository;

  beforeEach(() => {
    mockRepository = new MockProgressRepository();
    useCase = new CalculateModuleProgressUseCase(mockRepository);
  });

  describe('execute', () => {
    it('should calculate progress for existing module', async () => {
      // Arrange
      const userId = UserId.create('user-123').getValue();
      
      const lesson1 = LessonProgress.create({
        lessonId: 'lesson-1',
        status: LessonProgressStatus.COMPLETED,
        startedAt: new Date(),
        completedAt: new Date(),
        timeSpent: 900,
      }).getValue();

      const lesson2 = LessonProgress.create({
        lessonId: 'lesson-2',
        status: LessonProgressStatus.COMPLETED,
        startedAt: new Date(),
        completedAt: new Date(),
        timeSpent: 1200,
      }).getValue();

      const lesson3 = LessonProgress.create({
        lessonId: 'lesson-3',
        status: LessonProgressStatus.IN_PROGRESS,
        startedAt: new Date(),
        timeSpent: 300,
      }).getValue();

      const progress = Progress.create({
        userId,
        moduleId: 'module-456',
        lessonProgresses: [lesson1, lesson2, lesson3],
        startedAt: new Date(),
      }).getValue();

      mockRepository.setMockProgress(progress);

      const request = {
        userId: 'user-123',
        moduleId: 'module-456',
        totalLessons: 5
      };

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.isSuccess).toBe(true);
      const response = result.getValue();
      
      expect(response.moduleId).toBe('module-456');
      expect(response.progress.completedLessons).toBe(2);
      expect(response.progress.totalLessons).toBe(5);
      expect(response.progress.completionPercentage).toBe(40);
      expect(response.progress.isCompleted).toBe(false);
      expect(response.progress.totalTimeSpent).toBe(2400); // 900 + 1200 + 300
      expect(response.estimatedTimeRemaining).toBeDefined();
    });

    it('should calculate progress for completed module', async () => {
      // Arrange
      const userId = UserId.create('user-123').getValue();
      
      const lesson1 = LessonProgress.create({
        lessonId: 'lesson-1',
        status: LessonProgressStatus.COMPLETED,
        startedAt: new Date(),
        completedAt: new Date(),
        timeSpent: 800,
      }).getValue();

      const lesson2 = LessonProgress.create({
        lessonId: 'lesson-2',
        status: LessonProgressStatus.COMPLETED,
        startedAt: new Date(),
        completedAt: new Date(),
        timeSpent: 1000,
      }).getValue();

      const progress = Progress.create({
        userId,
        moduleId: 'module-456',
        lessonProgresses: [lesson1, lesson2],
        startedAt: new Date(),
        completedAt: new Date(),
      }).getValue();

      mockRepository.setMockProgress(progress);

      const request = {
        userId: 'user-123',
        moduleId: 'module-456',
        totalLessons: 2
      };

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.isSuccess).toBe(true);
      const response = result.getValue();
      
      expect(response.progress.completedLessons).toBe(2);
      expect(response.progress.totalLessons).toBe(2);
      expect(response.progress.completionPercentage).toBe(100);
      expect(response.progress.isCompleted).toBe(true);
      expect(response.estimatedTimeRemaining).toBe('0m');
    });

    it('should return null for non-existing progress', async () => {
      // Arrange
      const request = {
        userId: 'user-123',
        moduleId: 'non-existing-module',
        totalLessons: 5
      };

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.isSuccess).toBe(true);
      const response = result.getValue();
      expect(response).toBeNull();
    });

    it('should fail with invalid userId', async () => {
      // Arrange
      const request = {
        userId: '',
        moduleId: 'module-456',
        totalLessons: 5
      };

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toBe('UserId cannot be empty');
    });

    it('should fail with invalid moduleId', async () => {
      // Arrange
      const request = {
        userId: 'user-123',
        moduleId: '',
        totalLessons: 5
      };

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toBe('Module ID cannot be empty');
    });

    it('should fail with invalid totalLessons', async () => {
      // Arrange
      const request = {
        userId: 'user-123',
        moduleId: 'module-456',
        totalLessons: 0
      };

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toBe('Total lessons must be greater than 0');
    });

    it('should calculate estimated time remaining correctly', async () => {
      // Arrange
      const userId = UserId.create('user-123').getValue();
      
      // Создаем прогресс с одним завершенным уроком (1200 секунд)
      const completedLesson = LessonProgress.create({
        lessonId: 'lesson-1',
        status: LessonProgressStatus.COMPLETED,
        startedAt: new Date(),
        completedAt: new Date(),
        timeSpent: 1200, // 20 минут
      }).getValue();

      const progress = Progress.create({
        userId,
        moduleId: 'module-456',
        lessonProgresses: [completedLesson],
        startedAt: new Date(),
      }).getValue();

      mockRepository.setMockProgress(progress);

      const request = {
        userId: 'user-123',
        moduleId: 'module-456',
        totalLessons: 4 // Осталось 3 урока
      };

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.isSuccess).toBe(true);
      const response = result.getValue();
      
      // Среднее время на урок: 1200 секунд
      // Осталось уроков: 3
      // Ожидаемое время: 3 * 1200 = 3600 секунд = 1 час
      expect(response!.estimatedTimeRemaining).toBe('1h');
    });
  });
});