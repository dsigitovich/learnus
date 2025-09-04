import { Progress } from '../Progress';
import { UserId } from '../../value-objects/UserId';
import { LessonProgress, LessonProgressStatus } from '../../value-objects/LessonProgress';
import { ModuleProgress } from '../../value-objects/ModuleProgress';

describe('Progress', () => {
  describe('create', () => {
    it('should create progress with valid data', () => {
      // Arrange
      const userId = UserId.create('user-123').getValue();
      const moduleId = 'module-456';
      const lessonProgresses: LessonProgress[] = [];
      
      // Act
      const result = Progress.create({
        userId,
        moduleId,
        lessonProgresses,
        startedAt: new Date(),
      });
      
      // Assert
      expect(result.isSuccess).toBe(true);
      const progress = result.getValue();
      expect(progress.userId).toEqual(userId);
      expect(progress.moduleId).toBe(moduleId);
      expect(progress.lessonProgresses).toEqual(lessonProgresses);
    });

    it('should fail to create progress with empty moduleId', () => {
      // Arrange
      const userId = UserId.create('user-123').getValue();
      const moduleId = '';
      const lessonProgresses: LessonProgress[] = [];
      
      // Act
      const result = Progress.create({
        userId,
        moduleId,
        lessonProgresses,
        startedAt: new Date(),
      });
      
      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toBe('Module ID cannot be empty');
    });
  });

  describe('addLessonProgress', () => {
    it('should add lesson progress successfully', () => {
      // Arrange
      const userId = UserId.create('user-123').getValue();
      const progress = Progress.create({
        userId,
        moduleId: 'module-456',
        lessonProgresses: [],
        startedAt: new Date(),
      }).getValue();
      
      const lessonProgress = LessonProgress.create({
        lessonId: 'lesson-789',
        status: LessonProgressStatus.IN_PROGRESS,
        startedAt: new Date(),
      }).getValue();
      
      // Act
      const result = progress.addLessonProgress(lessonProgress);
      
      // Assert
      expect(result.isSuccess).toBe(true);
      expect(progress.lessonProgresses).toHaveLength(1);
      expect(progress.lessonProgresses[0]).toEqual(lessonProgress);
    });

    it('should not add duplicate lesson progress', () => {
      // Arrange
      const userId = UserId.create('user-123').getValue();
      const lessonProgress = LessonProgress.create({
        lessonId: 'lesson-789',
        status: LessonProgressStatus.IN_PROGRESS,
        startedAt: new Date(),
      }).getValue();
      
      const progress = Progress.create({
        userId,
        moduleId: 'module-456',
        lessonProgresses: [lessonProgress],
        startedAt: new Date(),
      }).getValue();
      
      const duplicateLessonProgress = LessonProgress.create({
        lessonId: 'lesson-789',
        status: LessonProgressStatus.COMPLETED,
        startedAt: new Date(),
      }).getValue();
      
      // Act
      const result = progress.addLessonProgress(duplicateLessonProgress);
      
      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toBe('Lesson progress already exists for this lesson');
    });
  });

  describe('updateLessonProgress', () => {
    it('should update existing lesson progress', () => {
      // Arrange
      const userId = UserId.create('user-123').getValue();
      const lessonProgress = LessonProgress.create({
        lessonId: 'lesson-789',
        status: LessonProgressStatus.IN_PROGRESS,
        startedAt: new Date(),
      }).getValue();
      
      const progress = Progress.create({
        userId,
        moduleId: 'module-456',
        lessonProgresses: [lessonProgress],
        startedAt: new Date(),
      }).getValue();
      
      const updatedLessonProgress = LessonProgress.create({
        lessonId: 'lesson-789',
        status: LessonProgressStatus.COMPLETED,
        startedAt: new Date(),
        completedAt: new Date(),
        timeSpent: 1800, // 30 minutes
      }).getValue();
      
      // Act
      const result = progress.updateLessonProgress(updatedLessonProgress);
      
      // Assert
      expect(result.isSuccess).toBe(true);
      expect(progress.lessonProgresses[0].status).toBe(LessonProgressStatus.COMPLETED);
      expect(progress.lessonProgresses[0].timeSpent).toBe(1800);
    });

    it('should fail to update non-existing lesson progress', () => {
      // Arrange
      const userId = UserId.create('user-123').getValue();
      const progress = Progress.create({
        userId,
        moduleId: 'module-456',
        lessonProgresses: [],
        startedAt: new Date(),
      }).getValue();
      
      const lessonProgress = LessonProgress.create({
        lessonId: 'lesson-789',
        status: LessonProgressStatus.COMPLETED,
        startedAt: new Date(),
      }).getValue();
      
      // Act
      const result = progress.updateLessonProgress(lessonProgress);
      
      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toBe('Lesson progress not found');
    });
  });

  describe('calculateModuleProgress', () => {
    it('should calculate module progress correctly', () => {
      // Arrange
      const userId = UserId.create('user-123').getValue();
      const lessonProgress1 = LessonProgress.create({
        lessonId: 'lesson-1',
        status: LessonProgressStatus.COMPLETED,
        startedAt: new Date(),
        completedAt: new Date(),
      }).getValue();
      
      const lessonProgress2 = LessonProgress.create({
        lessonId: 'lesson-2',
        status: LessonProgressStatus.IN_PROGRESS,
        startedAt: new Date(),
      }).getValue();
      
      const lessonProgress3 = LessonProgress.create({
        lessonId: 'lesson-3',
        status: LessonProgressStatus.NOT_STARTED,
        startedAt: new Date(),
      }).getValue();
      
      const progress = Progress.create({
        userId,
        moduleId: 'module-456',
        lessonProgresses: [lessonProgress1, lessonProgress2, lessonProgress3],
        startedAt: new Date(),
      }).getValue();
      
      const totalLessons = 3;
      
      // Act
      const moduleProgress = progress.calculateModuleProgress(totalLessons);
      
      // Assert
      expect(moduleProgress.completedLessons).toBe(1);
      expect(moduleProgress.totalLessons).toBe(3);
      expect(moduleProgress.completionPercentage).toBe(33.33);
      expect(moduleProgress.isCompleted).toBe(false);
    });

    it('should mark module as completed when all lessons are completed', () => {
      // Arrange
      const userId = UserId.create('user-123').getValue();
      const lessonProgress1 = LessonProgress.create({
        lessonId: 'lesson-1',
        status: LessonProgressStatus.COMPLETED,
        startedAt: new Date(),
        completedAt: new Date(),
      }).getValue();
      
      const lessonProgress2 = LessonProgress.create({
        lessonId: 'lesson-2',
        status: LessonProgressStatus.COMPLETED,
        startedAt: new Date(),
        completedAt: new Date(),
      }).getValue();
      
      const progress = Progress.create({
        userId,
        moduleId: 'module-456',
        lessonProgresses: [lessonProgress1, lessonProgress2],
        startedAt: new Date(),
      }).getValue();
      
      const totalLessons = 2;
      
      // Act
      const moduleProgress = progress.calculateModuleProgress(totalLessons);
      
      // Assert
      expect(moduleProgress.completedLessons).toBe(2);
      expect(moduleProgress.totalLessons).toBe(2);
      expect(moduleProgress.completionPercentage).toBe(100);
      expect(moduleProgress.isCompleted).toBe(true);
    });
  });

  describe('getTotalTimeSpent', () => {
    it('should calculate total time spent correctly', () => {
      // Arrange
      const userId = UserId.create('user-123').getValue();
      const lessonProgress1 = LessonProgress.create({
        lessonId: 'lesson-1',
        status: LessonProgressStatus.COMPLETED,
        startedAt: new Date(),
        completedAt: new Date(),
        timeSpent: 1800, // 30 minutes
      }).getValue();
      
      const lessonProgress2 = LessonProgress.create({
        lessonId: 'lesson-2',
        status: LessonProgressStatus.COMPLETED,
        startedAt: new Date(),
        completedAt: new Date(),
        timeSpent: 2400, // 40 minutes
      }).getValue();
      
      const progress = Progress.create({
        userId,
        moduleId: 'module-456',
        lessonProgresses: [lessonProgress1, lessonProgress2],
        startedAt: new Date(),
      }).getValue();
      
      // Act
      const totalTime = progress.getTotalTimeSpent();
      
      // Assert
      expect(totalTime).toBe(4200); // 70 minutes
    });

    it('should return 0 when no lessons have time spent', () => {
      // Arrange
      const userId = UserId.create('user-123').getValue();
      const progress = Progress.create({
        userId,
        moduleId: 'module-456',
        lessonProgresses: [],
        startedAt: new Date(),
      }).getValue();
      
      // Act
      const totalTime = progress.getTotalTimeSpent();
      
      // Assert
      expect(totalTime).toBe(0);
    });
  });
});