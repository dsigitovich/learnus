import { LessonProgress, LessonProgressStatus } from '../LessonProgress';

describe('LessonProgress', () => {
  describe('create', () => {
    it('should create lesson progress with valid data', () => {
      // Arrange
      const props = {
        lessonId: 'lesson-123',
        status: LessonProgressStatus.IN_PROGRESS,
        startedAt: new Date(),
      };
      
      // Act
      const result = LessonProgress.create(props);
      
      // Assert
      expect(result.isSuccess).toBe(true);
      const lessonProgress = result.getValue();
      expect(lessonProgress.lessonId).toBe(props.lessonId);
      expect(lessonProgress.status).toBe(props.status);
      expect(lessonProgress.startedAt).toBe(props.startedAt);
    });

    it('should fail to create with empty lessonId', () => {
      // Arrange
      const props = {
        lessonId: '',
        status: LessonProgressStatus.IN_PROGRESS,
        startedAt: new Date(),
      };
      
      // Act
      const result = LessonProgress.create(props);
      
      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toBe('Lesson ID cannot be empty');
    });

    it('should fail when completedAt is provided but status is not completed', () => {
      // Arrange
      const props = {
        lessonId: 'lesson-123',
        status: LessonProgressStatus.IN_PROGRESS,
        startedAt: new Date(),
        completedAt: new Date(),
      };
      
      // Act
      const result = LessonProgress.create(props);
      
      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toBe('Completed date can only be set for completed lessons');
    });

    it('should fail when timeSpent is negative', () => {
      // Arrange
      const props = {
        lessonId: 'lesson-123',
        status: LessonProgressStatus.COMPLETED,
        startedAt: new Date(),
        completedAt: new Date(),
        timeSpent: -100,
      };
      
      // Act
      const result = LessonProgress.create(props);
      
      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toBe('Time spent cannot be negative');
    });
  });

  describe('complete', () => {
    it('should complete lesson progress successfully', () => {
      // Arrange
      const lessonProgress = LessonProgress.create({
        lessonId: 'lesson-123',
        status: LessonProgressStatus.IN_PROGRESS,
        startedAt: new Date(),
      }).getValue();
      
      const completedAt = new Date();
      const timeSpent = 1800; // 30 minutes
      
      // Act
      const result = lessonProgress.complete(completedAt, timeSpent);
      
      // Assert
      expect(result.isSuccess).toBe(true);
      expect(lessonProgress.status).toBe(LessonProgressStatus.COMPLETED);
      expect(lessonProgress.completedAt).toBe(completedAt);
      expect(lessonProgress.timeSpent).toBe(timeSpent);
    });

    it('should fail to complete already completed lesson', () => {
      // Arrange
      const lessonProgress = LessonProgress.create({
        lessonId: 'lesson-123',
        status: LessonProgressStatus.COMPLETED,
        startedAt: new Date(),
        completedAt: new Date(),
        timeSpent: 1800,
      }).getValue();
      
      // Act
      const result = lessonProgress.complete(new Date(), 2400);
      
      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toBe('Lesson is already completed');
    });

    it('should fail to complete with negative time spent', () => {
      // Arrange
      const lessonProgress = LessonProgress.create({
        lessonId: 'lesson-123',
        status: LessonProgressStatus.IN_PROGRESS,
        startedAt: new Date(),
      }).getValue();
      
      // Act
      const result = lessonProgress.complete(new Date(), -100);
      
      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toBe('Time spent cannot be negative');
    });
  });

  describe('start', () => {
    it('should start lesson progress successfully', () => {
      // Arrange
      const lessonProgress = LessonProgress.create({
        lessonId: 'lesson-123',
        status: LessonProgressStatus.NOT_STARTED,
        startedAt: new Date(),
      }).getValue();
      
      const startedAt = new Date();
      
      // Act
      const result = lessonProgress.start(startedAt);
      
      // Assert
      expect(result.isSuccess).toBe(true);
      expect(lessonProgress.status).toBe(LessonProgressStatus.IN_PROGRESS);
      expect(lessonProgress.startedAt).toBe(startedAt);
    });

    it('should fail to start already started lesson', () => {
      // Arrange
      const lessonProgress = LessonProgress.create({
        lessonId: 'lesson-123',
        status: LessonProgressStatus.IN_PROGRESS,
        startedAt: new Date(),
      }).getValue();
      
      // Act
      const result = lessonProgress.start(new Date());
      
      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toBe('Lesson is already started or completed');
    });
  });

  describe('isCompleted', () => {
    it('should return true for completed lesson', () => {
      // Arrange
      const lessonProgress = LessonProgress.create({
        lessonId: 'lesson-123',
        status: LessonProgressStatus.COMPLETED,
        startedAt: new Date(),
        completedAt: new Date(),
        timeSpent: 1800,
      }).getValue();
      
      // Act & Assert
      expect(lessonProgress.isCompleted()).toBe(true);
    });

    it('should return false for non-completed lesson', () => {
      // Arrange
      const lessonProgress = LessonProgress.create({
        lessonId: 'lesson-123',
        status: LessonProgressStatus.IN_PROGRESS,
        startedAt: new Date(),
      }).getValue();
      
      // Act & Assert
      expect(lessonProgress.isCompleted()).toBe(false);
    });
  });

  describe('isInProgress', () => {
    it('should return true for in-progress lesson', () => {
      // Arrange
      const lessonProgress = LessonProgress.create({
        lessonId: 'lesson-123',
        status: LessonProgressStatus.IN_PROGRESS,
        startedAt: new Date(),
      }).getValue();
      
      // Act & Assert
      expect(lessonProgress.isInProgress()).toBe(true);
    });

    it('should return false for non-in-progress lesson', () => {
      // Arrange
      const lessonProgress = LessonProgress.create({
        lessonId: 'lesson-123',
        status: LessonProgressStatus.NOT_STARTED,
        startedAt: new Date(),
      }).getValue();
      
      // Act & Assert
      expect(lessonProgress.isInProgress()).toBe(false);
    });
  });
});