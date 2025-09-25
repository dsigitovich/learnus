import { LessonProgress } from '../LessonProgress';
import { ProgressStatus } from '../../value-objects/ProgressStatus';

describe('LessonProgress', () => {
  describe('create', () => {
    it('should create lesson progress with valid data', () => {
      const result = LessonProgress.create('lesson-1', 'user-1');
      
      expect(result.isSuccess).toBe(true);
      const lessonProgress = result.getValue();
      expect(lessonProgress.lessonId).toBe('lesson-1');
      expect(lessonProgress.userId).toBe('user-1');
      expect(lessonProgress.status.isNotStarted()).toBe(true);
    });

    it('should create lesson progress with custom status', () => {
      const status = ProgressStatus.inProgress();
      const result = LessonProgress.create('lesson-1', 'user-1', status);
      
      expect(result.isSuccess).toBe(true);
      const lessonProgress = result.getValue();
      expect(lessonProgress.status.isInProgress()).toBe(true);
    });

    it('should fail with empty lesson ID', () => {
      const result = LessonProgress.create('', 'user-1');
      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toBe('Lesson ID cannot be empty');
    });

    it('should fail with empty user ID', () => {
      const result = LessonProgress.create('lesson-1', '');
      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toBe('User ID cannot be empty');
    });
  });

  describe('start', () => {
    it('should start lesson from not started state', () => {
      const result = LessonProgress.create('lesson-1', 'user-1');
      expect(result.isSuccess).toBe(true);
      
      const lessonProgress = result.getValue();
      const startResult = lessonProgress.start();
      
      expect(startResult.isSuccess).toBe(true);
      expect(lessonProgress.status.isInProgress()).toBe(true);
      expect(lessonProgress.startedAt).toBeDefined();
    });

    it('should not start lesson from in progress state', () => {
      const status = ProgressStatus.inProgress();
      const result = LessonProgress.create('lesson-1', 'user-1', status);
      expect(result.isSuccess).toBe(true);
      
      const lessonProgress = result.getValue();
      const startResult = lessonProgress.start();
      
      expect(startResult.isFailure).toBe(true);
      expect(startResult.getError().message).toBe('Cannot start lesson that is not in not_started state');
    });

    it('should not start lesson from completed state', () => {
      const status = ProgressStatus.completed();
      const result = LessonProgress.create('lesson-1', 'user-1', status);
      expect(result.isSuccess).toBe(true);
      
      const lessonProgress = result.getValue();
      const startResult = lessonProgress.start();
      
      expect(startResult.isFailure).toBe(true);
      expect(startResult.getError().message).toBe('Cannot start lesson that is not in not_started state');
    });
  });

  describe('complete', () => {
    it('should complete lesson from in progress state', () => {
      const status = ProgressStatus.inProgress();
      const result = LessonProgress.create('lesson-1', 'user-1', status);
      expect(result.isSuccess).toBe(true);
      
      const lessonProgress = result.getValue();
      const completeResult = lessonProgress.complete();
      
      expect(completeResult.isSuccess).toBe(true);
      expect(lessonProgress.status.isCompleted()).toBe(true);
      expect(lessonProgress.completedAt).toBeDefined();
    });

    it('should not complete lesson from not started state', () => {
      const result = LessonProgress.create('lesson-1', 'user-1');
      expect(result.isSuccess).toBe(true);
      
      const lessonProgress = result.getValue();
      const completeResult = lessonProgress.complete();
      
      expect(completeResult.isFailure).toBe(true);
      expect(completeResult.getError().message).toBe('Cannot complete lesson that is not in progress');
    });

    it('should not complete lesson from completed state', () => {
      const status = ProgressStatus.completed();
      const result = LessonProgress.create('lesson-1', 'user-1', status);
      expect(result.isSuccess).toBe(true);
      
      const lessonProgress = result.getValue();
      const completeResult = lessonProgress.complete();
      
      expect(completeResult.isFailure).toBe(true);
      expect(completeResult.getError().message).toBe('Cannot complete lesson that is not in progress');
    });
  });

  describe('restart', () => {
    it('should restart lesson from completed state', () => {
      const status = ProgressStatus.completed();
      const result = LessonProgress.create('lesson-1', 'user-1', status);
      expect(result.isSuccess).toBe(true);
      
      const lessonProgress = result.getValue();
      const restartResult = lessonProgress.restart();
      
      expect(restartResult.isSuccess).toBe(true);
      expect(lessonProgress.status.isNotStarted()).toBe(true);
      expect(lessonProgress.startedAt).toBeUndefined();
      expect(lessonProgress.completedAt).toBeUndefined();
    });

    it('should not restart lesson from not started state', () => {
      const result = LessonProgress.create('lesson-1', 'user-1');
      expect(result.isSuccess).toBe(true);
      
      const lessonProgress = result.getValue();
      const restartResult = lessonProgress.restart();
      
      expect(restartResult.isFailure).toBe(true);
      expect(restartResult.getError().message).toBe('Cannot restart lesson that is not completed');
    });

    it('should not restart lesson from in progress state', () => {
      const status = ProgressStatus.inProgress();
      const result = LessonProgress.create('lesson-1', 'user-1', status);
      expect(result.isSuccess).toBe(true);
      
      const lessonProgress = result.getValue();
      const restartResult = lessonProgress.restart();
      
      expect(restartResult.isFailure).toBe(true);
      expect(restartResult.getError().message).toBe('Cannot restart lesson that is not completed');
    });
  });

  describe('notes', () => {
    it('should add notes to lesson progress', () => {
      const result = LessonProgress.create('lesson-1', 'user-1');
      expect(result.isSuccess).toBe(true);
      
      const lessonProgress = result.getValue();
      const notesResult = lessonProgress.addNotes('Great lesson!');
      
      expect(notesResult.isSuccess).toBe(true);
      expect(lessonProgress.notes).toBe('Great lesson!');
    });

    it('should update notes in lesson progress', () => {
      const result = LessonProgress.create('lesson-1', 'user-1');
      expect(result.isSuccess).toBe(true);
      
      const lessonProgress = result.getValue();
      lessonProgress.addNotes('Initial notes');
      
      const updateResult = lessonProgress.updateNotes('Updated notes');
      
      expect(updateResult.isSuccess).toBe(true);
      expect(lessonProgress.notes).toBe('Updated notes');
    });

    it('should fail with empty notes', () => {
      const result = LessonProgress.create('lesson-1', 'user-1');
      expect(result.isSuccess).toBe(true);
      
      const lessonProgress = result.getValue();
      const notesResult = lessonProgress.addNotes('');
      
      expect(notesResult.isFailure).toBe(true);
      expect(notesResult.getError().message).toBe('Notes cannot be empty');
    });
  });

  describe('duration', () => {
    it('should calculate duration for completed lesson', () => {
      const result = LessonProgress.create('lesson-1', 'user-1');
      expect(result.isSuccess).toBe(true);
      
      const lessonProgress = result.getValue();
      lessonProgress.start();
      
      // Simulate some time passing
      const startTime = lessonProgress.startedAt!;
      lessonProgress.props.startedAt = new Date(startTime.getTime() - 5 * 60 * 1000); // 5 minutes ago
      
      lessonProgress.complete();
      
      const duration = lessonProgress.getDuration();
      expect(duration).toBeDefined();
      expect(duration).toBeGreaterThan(0);
    });

    it('should return undefined duration for not started lesson', () => {
      const result = LessonProgress.create('lesson-1', 'user-1');
      expect(result.isSuccess).toBe(true);
      
      const lessonProgress = result.getValue();
      const duration = lessonProgress.getDuration();
      
      expect(duration).toBeUndefined();
    });

    it('should calculate duration in minutes', () => {
      const result = LessonProgress.create('lesson-1', 'user-1');
      expect(result.isSuccess).toBe(true);
      
      const lessonProgress = result.getValue();
      lessonProgress.start();
      
      // Simulate some time passing
      const startTime = lessonProgress.startedAt!;
      lessonProgress.props.startedAt = new Date(startTime.getTime() - 5 * 60 * 1000); // 5 minutes ago
      
      lessonProgress.complete();
      
      const durationInMinutes = lessonProgress.getDurationInMinutes();
      expect(durationInMinutes).toBeDefined();
      expect(durationInMinutes).toBeGreaterThan(0);
    });
  });

  describe('state checks', () => {
    it('should correctly identify completed state', () => {
      const status = ProgressStatus.completed();
      const result = LessonProgress.create('lesson-1', 'user-1', status);
      expect(result.isSuccess).toBe(true);
      
      const lessonProgress = result.getValue();
      expect(lessonProgress.isCompleted()).toBe(true);
      expect(lessonProgress.isInProgress()).toBe(false);
      expect(lessonProgress.isNotStarted()).toBe(false);
    });

    it('should correctly identify in progress state', () => {
      const status = ProgressStatus.inProgress();
      const result = LessonProgress.create('lesson-1', 'user-1', status);
      expect(result.isSuccess).toBe(true);
      
      const lessonProgress = result.getValue();
      expect(lessonProgress.isCompleted()).toBe(false);
      expect(lessonProgress.isInProgress()).toBe(true);
      expect(lessonProgress.isNotStarted()).toBe(false);
    });

    it('should correctly identify not started state', () => {
      const result = LessonProgress.create('lesson-1', 'user-1');
      expect(result.isSuccess).toBe(true);
      
      const lessonProgress = result.getValue();
      expect(lessonProgress.isCompleted()).toBe(false);
      expect(lessonProgress.isInProgress()).toBe(false);
      expect(lessonProgress.isNotStarted()).toBe(true);
    });
  });
});