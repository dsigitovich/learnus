import { GetCourseProgressUseCase } from '../GetCourseProgressUseCase';
import { ICourseProgressRepository } from '../../../domain/repositories/ICourseProgressRepository';
import { ICourseRepository } from '../../../domain/repositories/ICourseRepository';
import { Course } from '../../../domain/entities/Course';
import { Module } from '../../../domain/entities/Module';
import { Lesson } from '../../../domain/entities/Lesson';
import { CourseProgress } from '../../../domain/entities/CourseProgress';
import { LessonProgress } from '../../../domain/entities/LessonProgress';

describe('GetCourseProgressUseCase', () => {
  let useCase: GetCourseProgressUseCase;
  let mockCourseProgressRepository: jest.Mocked<ICourseProgressRepository>;
  let mockCourseRepository: jest.Mocked<ICourseRepository>;

  beforeEach(() => {
    mockCourseProgressRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByCourseIdAndUserId: jest.fn(),
      findByUserId: jest.fn(),
      delete: jest.fn(),
    };

    mockCourseRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      delete: jest.fn(),
    };

    useCase = new GetCourseProgressUseCase(
      mockCourseProgressRepository,
      mockCourseRepository
    );
  });

  describe('execute', () => {
    it('should get course progress successfully', async () => {
      // Arrange
      const dto = {
        courseId: 'course-1',
        userId: 'user-1',
      };

      const lesson = Lesson.create({
        title: 'Test Lesson',
        type: 'theory',
        content: 'Test content',
        promptsForUser: ['Test prompt'],
        expectedOutcome: 'Test outcome',
      }).getValue();

      const module = Module.create({
        title: 'Test Module',
        learningObjectives: ['Test objective'],
        lessons: [lesson],
      }).getValue();

      const course = Course.create({
        title: 'Test Course',
        description: 'Test description',
        level: 'Beginner',
        modules: [module],
      }).getValue();

      const courseProgress = CourseProgress.create('course-1', 'user-1').getValue();
      const lessonProgress = LessonProgress.create('lesson-1', 'user-1').getValue();
      lessonProgress.start();
      lessonProgress.complete();
      courseProgress.addLessonProgress(lessonProgress);

      mockCourseRepository.findById.mockResolvedValue({ isSuccess: true, getValue: () => course } as any);
      mockCourseProgressRepository.findByCourseIdAndUserId.mockResolvedValue({ 
        isSuccess: true, 
        getValue: () => courseProgress 
      } as any);

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.isSuccess).toBe(true);
      const response = result.getValue();
      expect(response.success).toBe(true);
      expect(response.courseProgress).toBeDefined();
      expect(response.courseProgress?.id).toBe(courseProgress.id);
      expect(response.courseProgress?.courseId).toBe('course-1');
      expect(response.courseProgress?.userId).toBe('user-1');
      expect(response.courseProgress?.completionPercentage).toBe(100);
      expect(response.courseProgress?.overallStatus).toBe('Завершено');
      expect(response.courseProgress?.totalLessons).toBe(1);
      expect(response.courseProgress?.completedLessons).toBe(1);
      expect(response.courseProgress?.lessonProgresses).toHaveLength(1);
    });

    it('should return empty progress when course progress not found', async () => {
      // Arrange
      const dto = {
        courseId: 'course-1',
        userId: 'user-1',
      };

      const lesson = Lesson.create({
        title: 'Test Lesson',
        type: 'theory',
        content: 'Test content',
        promptsForUser: ['Test prompt'],
        expectedOutcome: 'Test outcome',
      }).getValue();

      const module = Module.create({
        title: 'Test Module',
        learningObjectives: ['Test objective'],
        lessons: [lesson],
      }).getValue();

      const course = Course.create({
        title: 'Test Course',
        description: 'Test description',
        level: 'Beginner',
        modules: [module],
      }).getValue();

      mockCourseRepository.findById.mockResolvedValue({ isSuccess: true, getValue: () => course } as any);
      mockCourseProgressRepository.findByCourseIdAndUserId.mockResolvedValue({ 
        isSuccess: true, 
        getValue: () => null 
      } as any);

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.isSuccess).toBe(true);
      const response = result.getValue();
      expect(response.success).toBe(true);
      expect(response.courseProgress).toBeDefined();
      expect(response.courseProgress?.id).toBe('');
      expect(response.courseProgress?.courseId).toBe('course-1');
      expect(response.courseProgress?.userId).toBe('user-1');
      expect(response.courseProgress?.completionPercentage).toBe(0);
      expect(response.courseProgress?.overallStatus).toBe('Не начато');
      expect(response.courseProgress?.totalLessons).toBe(0);
      expect(response.courseProgress?.completedLessons).toBe(0);
      expect(response.courseProgress?.lessonProgresses).toHaveLength(0);
      expect(response.message).toBe('Course progress not found. User has not started this course yet.');
    });

    it('should fail with invalid course ID', async () => {
      // Arrange
      const dto = {
        courseId: '',
        userId: 'user-1',
      };

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toBe('Course ID is required');
    });

    it('should fail with invalid user ID', async () => {
      // Arrange
      const dto = {
        courseId: 'course-1',
        userId: '',
      };

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toBe('User ID is required');
    });

    it('should fail when course not found', async () => {
      // Arrange
      const dto = {
        courseId: 'course-1',
        userId: 'user-1',
      };

      mockCourseRepository.findById.mockResolvedValue({ 
        isSuccess: true, 
        getValue: () => null 
      } as any);

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toBe('Course not found');
    });

    it('should fail when course repository fails', async () => {
      // Arrange
      const dto = {
        courseId: 'course-1',
        userId: 'user-1',
      };

      mockCourseRepository.findById.mockResolvedValue({ 
        isSuccess: false, 
        getError: () => new Error('Database error') 
      } as any);

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toBe('Failed to find course');
    });

    it('should fail when course progress repository fails', async () => {
      // Arrange
      const dto = {
        courseId: 'course-1',
        userId: 'user-1',
      };

      const lesson = Lesson.create({
        title: 'Test Lesson',
        type: 'theory',
        content: 'Test content',
        promptsForUser: ['Test prompt'],
        expectedOutcome: 'Test outcome',
      }).getValue();

      const module = Module.create({
        title: 'Test Module',
        learningObjectives: ['Test objective'],
        lessons: [lesson],
      }).getValue();

      const course = Course.create({
        title: 'Test Course',
        description: 'Test description',
        level: 'Beginner',
        modules: [module],
      }).getValue();

      mockCourseRepository.findById.mockResolvedValue({ isSuccess: true, getValue: () => course } as any);
      mockCourseProgressRepository.findByCourseIdAndUserId.mockResolvedValue({ 
        isSuccess: false, 
        getError: () => new Error('Database error') 
      } as any);

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toBe('Failed to find course progress');
    });
  });
});