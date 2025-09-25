import { CourseProgress } from '../CourseProgress';
import { LessonProgress } from '../LessonProgress';
import { ProgressStatus } from '../../value-objects/ProgressStatus';

describe('CourseProgress', () => {
  describe('create', () => {
    it('should create course progress with valid data', () => {
      const result = CourseProgress.create('course-1', 'user-1');
      
      expect(result.isSuccess).toBe(true);
      const courseProgress = result.getValue();
      expect(courseProgress.courseId).toBe('course-1');
      expect(courseProgress.userId).toBe('user-1');
      expect(courseProgress.lessonProgresses).toEqual([]);
    });

    it('should create course progress with lesson progresses', () => {
      const lessonProgress1 = LessonProgress.create('lesson-1', 'user-1').getValue();
      const lessonProgress2 = LessonProgress.create('lesson-2', 'user-1').getValue();
      
      const result = CourseProgress.create('course-1', 'user-1', [lessonProgress1, lessonProgress2]);
      
      expect(result.isSuccess).toBe(true);
      const courseProgress = result.getValue();
      expect(courseProgress.lessonProgresses).toHaveLength(2);
    });

    it('should fail with empty course ID', () => {
      const result = CourseProgress.create('', 'user-1');
      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toBe('Course ID cannot be empty');
    });

    it('should fail with empty user ID', () => {
      const result = CourseProgress.create('course-1', '');
      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toBe('User ID cannot be empty');
    });
  });

  describe('addLessonProgress', () => {
    it('should add lesson progress to course', () => {
      const result = CourseProgress.create('course-1', 'user-1');
      expect(result.isSuccess).toBe(true);
      
      const courseProgress = result.getValue();
      const lessonProgress = LessonProgress.create('lesson-1', 'user-1').getValue();
      
      const addResult = courseProgress.addLessonProgress(lessonProgress);
      expect(addResult.isSuccess).toBe(true);
      expect(courseProgress.lessonProgresses).toHaveLength(1);
    });

    it('should fail to add lesson progress with different user ID', () => {
      const result = CourseProgress.create('course-1', 'user-1');
      expect(result.isSuccess).toBe(true);
      
      const courseProgress = result.getValue();
      const lessonProgress = LessonProgress.create('lesson-1', 'user-2').getValue();
      
      const addResult = courseProgress.addLessonProgress(lessonProgress);
      expect(addResult.isFailure).toBe(true);
      expect(addResult.getError().message).toBe('Lesson progress user ID does not match course progress user ID');
    });

    it('should fail to add duplicate lesson progress', () => {
      const result = CourseProgress.create('course-1', 'user-1');
      expect(result.isSuccess).toBe(true);
      
      const courseProgress = result.getValue();
      const lessonProgress1 = LessonProgress.create('lesson-1', 'user-1').getValue();
      const lessonProgress2 = LessonProgress.create('lesson-1', 'user-1').getValue();
      
      courseProgress.addLessonProgress(lessonProgress1);
      const addResult = courseProgress.addLessonProgress(lessonProgress2);
      
      expect(addResult.isFailure).toBe(true);
      expect(addResult.getError().message).toBe('Lesson progress already exists for this lesson');
    });
  });

  describe('updateLessonProgress', () => {
    it('should update lesson progress to in progress', () => {
      const lessonProgress = LessonProgress.create('lesson-1', 'user-1').getValue();
      const result = CourseProgress.create('course-1', 'user-1', [lessonProgress]);
      expect(result.isSuccess).toBe(true);
      
      const courseProgress = result.getValue();
      const updateResult = courseProgress.updateLessonProgress('lesson-1', ProgressStatus.inProgress());
      
      expect(updateResult.isSuccess).toBe(true);
      const updatedLessonProgress = courseProgress.getLessonProgress('lesson-1');
      expect(updatedLessonProgress?.isInProgress()).toBe(true);
    });

    it('should update lesson progress to completed', () => {
      const lessonProgress = LessonProgress.create('lesson-1', 'user-1').getValue();
      lessonProgress.start(); // Start the lesson first
      
      const result = CourseProgress.create('course-1', 'user-1', [lessonProgress]);
      expect(result.isSuccess).toBe(true);
      
      const courseProgress = result.getValue();
      const updateResult = courseProgress.updateLessonProgress('lesson-1', ProgressStatus.completed());
      
      expect(updateResult.isSuccess).toBe(true);
      const updatedLessonProgress = courseProgress.getLessonProgress('lesson-1');
      expect(updatedLessonProgress?.isCompleted()).toBe(true);
    });

    it('should fail to update non-existent lesson progress', () => {
      const result = CourseProgress.create('course-1', 'user-1');
      expect(result.isSuccess).toBe(true);
      
      const courseProgress = result.getValue();
      const updateResult = courseProgress.updateLessonProgress('lesson-1', ProgressStatus.inProgress());
      
      expect(updateResult.isFailure).toBe(true);
      expect(updateResult.getError().message).toBe('Lesson progress not found');
    });
  });

  describe('progress calculations', () => {
    it('should calculate total lessons', () => {
      const lessonProgress1 = LessonProgress.create('lesson-1', 'user-1').getValue();
      const lessonProgress2 = LessonProgress.create('lesson-2', 'user-1').getValue();
      
      const result = CourseProgress.create('course-1', 'user-1', [lessonProgress1, lessonProgress2]);
      expect(result.isSuccess).toBe(true);
      
      const courseProgress = result.getValue();
      expect(courseProgress.getTotalLessons()).toBe(2);
    });

    it('should calculate completed lessons', () => {
      const lessonProgress1 = LessonProgress.create('lesson-1', 'user-1').getValue();
      const lessonProgress2 = LessonProgress.create('lesson-2', 'user-1').getValue();
      
      lessonProgress1.start();
      lessonProgress1.complete();
      
      const result = CourseProgress.create('course-1', 'user-1', [lessonProgress1, lessonProgress2]);
      expect(result.isSuccess).toBe(true);
      
      const courseProgress = result.getValue();
      expect(courseProgress.getCompletedLessons()).toBe(1);
    });

    it('should calculate in progress lessons', () => {
      const lessonProgress1 = LessonProgress.create('lesson-1', 'user-1').getValue();
      const lessonProgress2 = LessonProgress.create('lesson-2', 'user-1').getValue();
      
      lessonProgress1.start();
      
      const result = CourseProgress.create('course-1', 'user-1', [lessonProgress1, lessonProgress2]);
      expect(result.isSuccess).toBe(true);
      
      const courseProgress = result.getValue();
      expect(courseProgress.getInProgressLessons()).toBe(1);
    });

    it('should calculate not started lessons', () => {
      const lessonProgress1 = LessonProgress.create('lesson-1', 'user-1').getValue();
      const lessonProgress2 = LessonProgress.create('lesson-2', 'user-1').getValue();
      
      lessonProgress1.start();
      
      const result = CourseProgress.create('course-1', 'user-1', [lessonProgress1, lessonProgress2]);
      expect(result.isSuccess).toBe(true);
      
      const courseProgress = result.getValue();
      expect(courseProgress.getNotStartedLessons()).toBe(1);
    });

    it('should calculate completion percentage', () => {
      const lessonProgress1 = LessonProgress.create('lesson-1', 'user-1').getValue();
      const lessonProgress2 = LessonProgress.create('lesson-2', 'user-1').getValue();
      
      lessonProgress1.start();
      lessonProgress1.complete();
      
      const result = CourseProgress.create('course-1', 'user-1', [lessonProgress1, lessonProgress2]);
      expect(result.isSuccess).toBe(true);
      
      const courseProgress = result.getValue();
      expect(courseProgress.getCompletionPercentage()).toBe(50);
    });

    it('should return 0 completion percentage for empty course', () => {
      const result = CourseProgress.create('course-1', 'user-1');
      expect(result.isSuccess).toBe(true);
      
      const courseProgress = result.getValue();
      expect(courseProgress.getCompletionPercentage()).toBe(0);
    });
  });

  describe('overall status', () => {
    it('should return not started for empty course', () => {
      const result = CourseProgress.create('course-1', 'user-1');
      expect(result.isSuccess).toBe(true);
      
      const courseProgress = result.getValue();
      const status = courseProgress.getOverallStatus();
      expect(status.isNotStarted()).toBe(true);
    });

    it('should return in progress when some lessons are completed', () => {
      const lessonProgress1 = LessonProgress.create('lesson-1', 'user-1').getValue();
      const lessonProgress2 = LessonProgress.create('lesson-2', 'user-1').getValue();
      
      lessonProgress1.start();
      lessonProgress1.complete();
      
      const result = CourseProgress.create('course-1', 'user-1', [lessonProgress1, lessonProgress2]);
      expect(result.isSuccess).toBe(true);
      
      const courseProgress = result.getValue();
      const status = courseProgress.getOverallStatus();
      expect(status.isInProgress()).toBe(true);
    });

    it('should return completed when all lessons are completed', () => {
      const lessonProgress1 = LessonProgress.create('lesson-1', 'user-1').getValue();
      const lessonProgress2 = LessonProgress.create('lesson-2', 'user-1').getValue();
      
      lessonProgress1.start();
      lessonProgress1.complete();
      lessonProgress2.start();
      lessonProgress2.complete();
      
      const result = CourseProgress.create('course-1', 'user-1', [lessonProgress1, lessonProgress2]);
      expect(result.isSuccess).toBe(true);
      
      const courseProgress = result.getValue();
      const status = courseProgress.getOverallStatus();
      expect(status.isCompleted()).toBe(true);
    });
  });

  describe('start and complete', () => {
    it('should start course', () => {
      const lessonProgress = LessonProgress.create('lesson-1', 'user-1').getValue();
      const result = CourseProgress.create('course-1', 'user-1', [lessonProgress]);
      expect(result.isSuccess).toBe(true);
      
      const courseProgress = result.getValue();
      const startResult = courseProgress.start();
      
      expect(startResult.isSuccess).toBe(true);
      expect(courseProgress.startedAt).toBeDefined();
    });

    it('should fail to start course with no lessons', () => {
      const result = CourseProgress.create('course-1', 'user-1');
      expect(result.isSuccess).toBe(true);
      
      const courseProgress = result.getValue();
      const startResult = courseProgress.start();
      
      expect(startResult.isFailure).toBe(true);
      expect(startResult.getError().message).toBe('Cannot start course with no lessons');
    });

    it('should complete course when 100% finished', () => {
      const lessonProgress = LessonProgress.create('lesson-1', 'user-1').getValue();
      lessonProgress.start();
      lessonProgress.complete();
      
      const result = CourseProgress.create('course-1', 'user-1', [lessonProgress]);
      expect(result.isSuccess).toBe(true);
      
      const courseProgress = result.getValue();
      const completeResult = courseProgress.complete();
      
      expect(completeResult.isSuccess).toBe(true);
      expect(courseProgress.completedAt).toBeDefined();
    });

    it('should fail to complete course that is not 100% finished', () => {
      const lessonProgress = LessonProgress.create('lesson-1', 'user-1').getValue();
      lessonProgress.start();
      
      const result = CourseProgress.create('course-1', 'user-1', [lessonProgress]);
      expect(result.isSuccess).toBe(true);
      
      const courseProgress = result.getValue();
      const completeResult = courseProgress.complete();
      
      expect(completeResult.isFailure).toBe(true);
      expect(completeResult.getError().message).toBe('Cannot complete course that is not 100% finished');
    });
  });

  describe('duration calculations', () => {
    it('should calculate total duration', () => {
      const lessonProgress1 = LessonProgress.create('lesson-1', 'user-1').getValue();
      const lessonProgress2 = LessonProgress.create('lesson-2', 'user-1').getValue();
      
      lessonProgress1.start();
      lessonProgress1.complete();
      lessonProgress2.start();
      lessonProgress2.complete();
      
      const result = CourseProgress.create('course-1', 'user-1', [lessonProgress1, lessonProgress2]);
      expect(result.isSuccess).toBe(true);
      
      const courseProgress = result.getValue();
      const totalDuration = courseProgress.getTotalDuration();
      expect(totalDuration).toBeGreaterThan(0);
    });

    it('should calculate total duration in minutes', () => {
      const lessonProgress = LessonProgress.create('lesson-1', 'user-1').getValue();
      lessonProgress.start();
      lessonProgress.complete();
      
      const result = CourseProgress.create('course-1', 'user-1', [lessonProgress]);
      expect(result.isSuccess).toBe(true);
      
      const courseProgress = result.getValue();
      const totalDurationInMinutes = courseProgress.getTotalDurationInMinutes();
      expect(totalDurationInMinutes).toBeGreaterThan(0);
    });

    it('should calculate average lesson duration', () => {
      const lessonProgress = LessonProgress.create('lesson-1', 'user-1').getValue();
      lessonProgress.start();
      lessonProgress.complete();
      
      const result = CourseProgress.create('course-1', 'user-1', [lessonProgress]);
      expect(result.isSuccess).toBe(true);
      
      const courseProgress = result.getValue();
      const averageDuration = courseProgress.getAverageLessonDuration();
      expect(averageDuration).toBeGreaterThan(0);
    });

    it('should calculate average lesson duration in minutes', () => {
      const lessonProgress = LessonProgress.create('lesson-1', 'user-1').getValue();
      lessonProgress.start();
      lessonProgress.complete();
      
      const result = CourseProgress.create('course-1', 'user-1', [lessonProgress]);
      expect(result.isSuccess).toBe(true);
      
      const courseProgress = result.getValue();
      const averageDurationInMinutes = courseProgress.getAverageLessonDurationInMinutes();
      expect(averageDurationInMinutes).toBeGreaterThan(0);
    });
  });

  describe('state checks', () => {
    it('should correctly identify completed state', () => {
      const lessonProgress = LessonProgress.create('lesson-1', 'user-1').getValue();
      lessonProgress.start();
      lessonProgress.complete();
      
      const result = CourseProgress.create('course-1', 'user-1', [lessonProgress]);
      expect(result.isSuccess).toBe(true);
      
      const courseProgress = result.getValue();
      expect(courseProgress.isCompleted()).toBe(true);
      expect(courseProgress.isInProgress()).toBe(false);
      expect(courseProgress.isNotStarted()).toBe(false);
    });

    it('should correctly identify in progress state', () => {
      const lessonProgress = LessonProgress.create('lesson-1', 'user-1').getValue();
      lessonProgress.start();
      
      const result = CourseProgress.create('course-1', 'user-1', [lessonProgress]);
      expect(result.isSuccess).toBe(true);
      
      const courseProgress = result.getValue();
      expect(courseProgress.isCompleted()).toBe(false);
      expect(courseProgress.isInProgress()).toBe(true);
      expect(courseProgress.isNotStarted()).toBe(false);
    });

    it('should correctly identify not started state', () => {
      const lessonProgress = LessonProgress.create('lesson-1', 'user-1').getValue();
      
      const result = CourseProgress.create('course-1', 'user-1', [lessonProgress]);
      expect(result.isSuccess).toBe(true);
      
      const courseProgress = result.getValue();
      expect(courseProgress.isCompleted()).toBe(false);
      expect(courseProgress.isInProgress()).toBe(false);
      expect(courseProgress.isNotStarted()).toBe(true);
    });
  });
});