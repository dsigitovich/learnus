import { UpdateLessonProgressUseCase } from '../UpdateLessonProgressUseCase';
import { ICourseProgressRepository } from '../../../domain/repositories/ICourseProgressRepository';
import { ICourseRepository } from '../../../domain/repositories/ICourseRepository';
import { Course } from '../../../domain/entities/Course';
import { Module } from '../../../domain/entities/Module';
import { Lesson } from '../../../domain/entities/Lesson';
import { CourseProgress } from '../../../domain/entities/CourseProgress';
import { LessonProgress } from '../../../domain/entities/LessonProgress';

describe('UpdateLessonProgressUseCase', () => {
  let useCase: UpdateLessonProgressUseCase;
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
      findByTitle: jest.fn(),
      findByLevel: jest.fn(),
    };

    useCase = new UpdateLessonProgressUseCase(
      mockCourseProgressRepository,
      mockCourseRepository
    );
  });

  describe('execute', () => {
    it('should update lesson progress successfully', async () => {
      // Arrange
      const dto = {
        courseId: 'course-1',
        lessonId: 'lesson-1',
        userId: 'user-1',
        status: 'in_progress' as const,
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
      courseProgress.addLessonProgress(lessonProgress);

      mockCourseRepository.findById.mockResolvedValue({ isSuccess: true, getValue: () => course } as any);
      mockCourseProgressRepository.findByCourseIdAndUserId.mockResolvedValue({ 
        isSuccess: true, 
        getValue: () => courseProgress 
      } as any);
      mockCourseProgressRepository.save.mockResolvedValue({ isSuccess: true } as any);

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.isSuccess).toBe(true);
      const response = result.getValue();
      expect(response.success).toBe(true);
      expect(response.message).toBe('Lesson progress updated successfully');
      expect(response.courseProgress).toBeDefined();
      expect(mockCourseProgressRepository.save).toHaveBeenCalledWith(courseProgress);
    });

    it('should create new course progress if not exists', async () => {
      // Arrange
      const dto = {
        courseId: 'course-1',
        lessonId: 'lesson-1',
        userId: 'user-1',
        status: 'in_progress' as const,
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
      mockCourseProgressRepository.save.mockResolvedValue({ isSuccess: true } as any);

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.isSuccess).toBe(true);
      const response = result.getValue();
      expect(response.success).toBe(true);
      expect(mockCourseProgressRepository.save).toHaveBeenCalled();
    });

    it('should fail with invalid course ID', async () => {
      // Arrange
      const dto = {
        courseId: '',
        lessonId: 'lesson-1',
        userId: 'user-1',
        status: 'in_progress' as const,
      };

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toBe('Course ID is required');
    });

    it('should fail with invalid lesson ID', async () => {
      // Arrange
      const dto = {
        courseId: 'course-1',
        lessonId: '',
        userId: 'user-1',
        status: 'in_progress' as const,
      };

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toBe('Lesson ID is required');
    });

    it('should fail with invalid user ID', async () => {
      // Arrange
      const dto = {
        courseId: 'course-1',
        lessonId: 'lesson-1',
        userId: '',
        status: 'in_progress' as const,
      };

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toBe('User ID is required');
    });

    it('should fail with invalid status', async () => {
      // Arrange
      const dto = {
        courseId: 'course-1',
        lessonId: 'lesson-1',
        userId: 'user-1',
        status: 'invalid' as any,
      };

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toBe('Invalid status. Must be not_started, in_progress, or completed');
    });

    it('should fail when course not found', async () => {
      // Arrange
      const dto = {
        courseId: 'course-1',
        lessonId: 'lesson-1',
        userId: 'user-1',
        status: 'in_progress' as const,
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
        lessonId: 'lesson-1',
        userId: 'user-1',
        status: 'in_progress' as const,
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
        lessonId: 'lesson-1',
        userId: 'user-1',
        status: 'in_progress' as const,
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

    it('should fail when save fails', async () => {
      // Arrange
      const dto = {
        courseId: 'course-1',
        lessonId: 'lesson-1',
        userId: 'user-1',
        status: 'in_progress' as const,
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

      mockCourseRepository.findById.mockResolvedValue({ isSuccess: true, getValue: () => course } as any);
      mockCourseProgressRepository.findByCourseIdAndUserId.mockResolvedValue({ 
        isSuccess: true, 
        getValue: () => courseProgress 
      } as any);
      mockCourseProgressRepository.save.mockResolvedValue({ 
        isSuccess: false, 
        getError: () => new Error('Save failed') 
      } as any);

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toBe('Save failed');
    });
  });
});