import { GetUserProgressUseCase } from '../GetUserProgressUseCase';
import { IProgressRepository, UserStatistics } from '@domain/repositories/IProgressRepository';
import { Progress } from '@domain/entities/Progress';
import { UserId } from '@domain/value-objects/UserId';
import { LessonProgress, LessonProgressStatus } from '@domain/value-objects/LessonProgress';
import { Result } from '@shared/types/result';

// Mock repository
class MockProgressRepository implements IProgressRepository {
  private progresses: Map<string, Progress> = new Map();
  private mockStats: UserStatistics = {
    totalModulesStarted: 3,
    totalModulesCompleted: 1,
    totalLessonsCompleted: 8,
    totalTimeSpent: 7200, // 2 hours
    currentStreak: 5,
    longestStreak: 10,
    averageTimePerLesson: 900, // 15 minutes
    completionRate: 33.33
  };

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
    const progress = Array.from(this.progresses.values())
      .find(p => p.id === progressId);
    return Result.ok(progress || null);
  }

  async delete(progressId: string): Promise<Result<void>> {
    return Result.ok();
  }

  async getUserStatistics(userId: UserId): Promise<Result<UserStatistics>> {
    return Result.ok(this.mockStats);
  }

  async getTopUsers(): Promise<Result<any[]>> {
    return Result.ok([]);
  }

  // Helper для тестов
  setMockProgresses(progresses: Progress[]) {
    this.progresses.clear();
    for (const progress of progresses) {
      this.progresses.set(`${progress.userId.toString()}-${progress.moduleId}`, progress);
    }
  }
}

describe('GetUserProgressUseCase', () => {
  let useCase: GetUserProgressUseCase;
  let mockRepository: MockProgressRepository;

  beforeEach(() => {
    mockRepository = new MockProgressRepository();
    useCase = new GetUserProgressUseCase(mockRepository);
  });

  describe('execute', () => {
    it('should return user progress summary with statistics', async () => {
      // Arrange
      const userId = UserId.create('user-123').getValue();
      
      const lessonProgress1 = LessonProgress.create({
        lessonId: 'lesson-1',
        status: LessonProgressStatus.COMPLETED,
        startedAt: new Date(),
        completedAt: new Date(),
        timeSpent: 900,
      }).getValue();

      const lessonProgress2 = LessonProgress.create({
        lessonId: 'lesson-2',
        status: LessonProgressStatus.IN_PROGRESS,
        startedAt: new Date(),
        timeSpent: 300,
      }).getValue();

      const progress1 = Progress.create({
        userId,
        moduleId: 'module-1',
        lessonProgresses: [lessonProgress1, lessonProgress2],
        startedAt: new Date(),
      }).getValue();

      const progress2 = Progress.create({
        userId,
        moduleId: 'module-2',
        lessonProgresses: [],
        startedAt: new Date(),
      }).getValue();

      mockRepository.setMockProgresses([progress1, progress2]);

      const request = {
        userId: 'user-123'
      };

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.isSuccess).toBe(true);
      const response = result.getValue();
      
      expect(response.userId).toBe('user-123');
      expect(response.moduleProgresses).toHaveLength(2);
      expect(response.statistics.totalModulesStarted).toBe(3);
      expect(response.statistics.totalLessonsCompleted).toBe(8);
      expect(response.statistics.currentStreak).toBe(5);
    });

    it('should return empty progress for user with no modules', async () => {
      // Arrange
      const request = {
        userId: 'user-456'
      };

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.isSuccess).toBe(true);
      const response = result.getValue();
      
      expect(response.userId).toBe('user-456');
      expect(response.moduleProgresses).toHaveLength(0);
      expect(response.statistics.totalModulesStarted).toBe(3); // Mock data
    });

    it('should fail with invalid userId', async () => {
      // Arrange
      const request = {
        userId: ''
      };

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toBe('UserId cannot be empty');
    });

    it('should calculate module progress correctly', async () => {
      // Arrange
      const userId = UserId.create('user-123').getValue();
      
      const completedLesson = LessonProgress.create({
        lessonId: 'lesson-1',
        status: LessonProgressStatus.COMPLETED,
        startedAt: new Date(),
        completedAt: new Date(),
        timeSpent: 1200,
      }).getValue();

      const inProgressLesson = LessonProgress.create({
        lessonId: 'lesson-2',
        status: LessonProgressStatus.IN_PROGRESS,
        startedAt: new Date(),
        timeSpent: 600,
      }).getValue();

      const progress = Progress.create({
        userId,
        moduleId: 'module-1',
        lessonProgresses: [completedLesson, inProgressLesson],
        startedAt: new Date(),
      }).getValue();

      mockRepository.setMockProgresses([progress]);

      const request = {
        userId: 'user-123',
        moduleId: 'module-1',
        totalLessonsInModule: 3 // Предполагаем, что в модуле 3 урока
      };

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.isSuccess).toBe(true);
      const response = result.getValue();
      
      const moduleProgress = response.moduleProgresses[0];
      expect(moduleProgress.moduleId).toBe('module-1');
      expect(moduleProgress.progress.completedLessons).toBe(1);
      expect(moduleProgress.progress.totalLessons).toBe(3);
      expect(moduleProgress.progress.completionPercentage).toBe(33.33);
      expect(moduleProgress.progress.isCompleted).toBe(false);
      expect(moduleProgress.progress.totalTimeSpent).toBe(1800);
    });
  });
});