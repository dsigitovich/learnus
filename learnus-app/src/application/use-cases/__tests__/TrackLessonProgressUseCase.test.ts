import { TrackLessonProgressUseCase } from '../TrackLessonProgressUseCase';
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
    const progress = Array.from(this.progresses.values())
      .find(p => p.id === progressId);
    return Result.ok(progress || null);
  }

  async delete(progressId: string): Promise<Result<void>> {
    for (const [key, progress] of this.progresses.entries()) {
      if (progress.id === progressId) {
        this.progresses.delete(key);
        break;
      }
    }
    return Result.ok();
  }

  async getUserStatistics(): Promise<Result<any>> {
    return Result.ok({});
  }

  async getTopUsers(): Promise<Result<any[]>> {
    return Result.ok([]);
  }
}

describe('TrackLessonProgressUseCase', () => {
  let useCase: TrackLessonProgressUseCase;
  let mockRepository: MockProgressRepository;

  beforeEach(() => {
    mockRepository = new MockProgressRepository();
    useCase = new TrackLessonProgressUseCase(mockRepository);
  });

  describe('execute', () => {
    it('should create new progress when none exists', async () => {
      // Arrange
      const request = {
        userId: 'user-123',
        moduleId: 'module-456',
        lessonId: 'lesson-789',
        status: LessonProgressStatus.IN_PROGRESS,
        timeSpent: 0,
      };

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.isSuccess).toBe(true);
      
      const savedProgress = await mockRepository.findByUserAndModule(
        UserId.create('user-123').getValue(),
        'module-456'
      );
      expect(savedProgress.getValue()).toBeTruthy();
      expect(savedProgress.getValue()!.lessonProgresses).toHaveLength(1);
    });

    it('should update existing lesson progress', async () => {
      // Arrange
      const userId = UserId.create('user-123').getValue();
      const existingLessonProgress = LessonProgress.create({
        lessonId: 'lesson-789',
        status: LessonProgressStatus.IN_PROGRESS,
        startedAt: new Date(),
        timeSpent: 600,
      }).getValue();

      const existingProgress = Progress.create({
        userId,
        moduleId: 'module-456',
        lessonProgresses: [existingLessonProgress],
        startedAt: new Date(),
      }).getValue();

      await mockRepository.save(existingProgress);

      const request = {
        userId: 'user-123',
        moduleId: 'module-456',
        lessonId: 'lesson-789',
        status: LessonProgressStatus.COMPLETED,
        timeSpent: 1200,
      };

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.isSuccess).toBe(true);
      
      const updatedProgress = await mockRepository.findByUserAndModule(userId, 'module-456');
      const lessonProgress = updatedProgress.getValue()!.getLessonProgress('lesson-789');
      expect(lessonProgress!.status).toBe(LessonProgressStatus.COMPLETED);
      expect(lessonProgress!.timeSpent).toBe(1200);
    });

    it('should add new lesson progress to existing module progress', async () => {
      // Arrange
      const userId = UserId.create('user-123').getValue();
      const existingLessonProgress = LessonProgress.create({
        lessonId: 'lesson-1',
        status: LessonProgressStatus.COMPLETED,
        startedAt: new Date(),
        completedAt: new Date(),
        timeSpent: 900,
      }).getValue();

      const existingProgress = Progress.create({
        userId,
        moduleId: 'module-456',
        lessonProgresses: [existingLessonProgress],
        startedAt: new Date(),
      }).getValue();

      await mockRepository.save(existingProgress);

      const request = {
        userId: 'user-123',
        moduleId: 'module-456',
        lessonId: 'lesson-2',
        status: LessonProgressStatus.IN_PROGRESS,
        timeSpent: 0,
      };

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.isSuccess).toBe(true);
      
      const updatedProgress = await mockRepository.findByUserAndModule(userId, 'module-456');
      expect(updatedProgress.getValue()!.lessonProgresses).toHaveLength(2);
      
      const newLessonProgress = updatedProgress.getValue()!.getLessonProgress('lesson-2');
      expect(newLessonProgress!.status).toBe(LessonProgressStatus.IN_PROGRESS);
    });

    it('should fail with invalid userId', async () => {
      // Arrange
      const request = {
        userId: '',
        moduleId: 'module-456',
        lessonId: 'lesson-789',
        status: LessonProgressStatus.IN_PROGRESS,
        timeSpent: 0,
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
        lessonId: 'lesson-789',
        status: LessonProgressStatus.IN_PROGRESS,
        timeSpent: 0,
      };

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toBe('Module ID cannot be empty');
    });

    it('should fail with negative time spent', async () => {
      // Arrange
      const request = {
        userId: 'user-123',
        moduleId: 'module-456',
        lessonId: 'lesson-789',
        status: LessonProgressStatus.IN_PROGRESS,
        timeSpent: -100,
      };

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toBe('Time spent cannot be negative');
    });
  });
});