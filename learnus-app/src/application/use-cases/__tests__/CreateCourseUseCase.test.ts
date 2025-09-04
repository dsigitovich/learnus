import { CreateCourseUseCase } from '../CreateCourseUseCase';
import { ICourseRepository } from '@domain/repositories/ICourseRepository';
import { IAIService } from '@application/interfaces/IAIService';
import { IEventBus } from '@application/interfaces/IEventBus';
import { CreateCourseDto } from '@application/dto/CreateCourseDto';
import { Module } from '@domain/entities/Module';
import { Lesson } from '@domain/entities/Lesson';
import { Result } from '@shared/types/result';

describe('CreateCourseUseCase', () => {
  let mockCourseRepository: jest.Mocked<ICourseRepository>;
  let mockAIService: jest.Mocked<IAIService>;
  let mockEventBus: jest.Mocked<IEventBus>;
  let useCase: CreateCourseUseCase;

  beforeEach(() => {
    mockCourseRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      delete: jest.fn(),
      exists: jest.fn(),
    };

    mockAIService = {
      generateCourse: jest.fn(),
      generateSocraticResponse: jest.fn(),
    };

    mockEventBus = {
      publish: jest.fn(),
      subscribe: jest.fn(),
    };

    useCase = new CreateCourseUseCase(
      mockCourseRepository,
      mockAIService,
      mockEventBus
    );
  });

  describe('execute', () => {
    it('should create course successfully', async () => {
      // Arrange
      const request: CreateCourseDto = {
        title: 'React for Beginners',
        description: 'Learn React from scratch',
        level: 'Beginner',
        prompt: 'Create a comprehensive React course for beginners',
      };

      const lesson = Lesson.create({
        title: 'Introduction to React',
        type: 'theory',
        content: 'React is a JavaScript library',
        promptsForUser: ['What is React?'],
        expectedOutcome: 'Understand React basics',
      }).getValue();

      const module = Module.create({
        title: 'Getting Started',
        learningObjectives: ['Understand React fundamentals'],
        lessons: [lesson],
      }).getValue();

      const generatedCourse = {
        title: request.title,
        description: request.description,
        level: request.level,
        modules: [module],
      };

      mockAIService.generateCourse.mockResolvedValue(Result.ok(generatedCourse));
      mockCourseRepository.save.mockResolvedValue(Result.ok(undefined));
      mockEventBus.publish.mockResolvedValue(undefined);

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.isSuccess).toBe(true);
      const response = result.getValue();
      expect(response.title).toBe(request.title);
      expect(response.description).toBe(request.description);
      expect(response.level).toBe(request.level);
      expect(response.totalModules).toBe(1);
      expect(response.totalLessons).toBe(1);

      expect(mockAIService.generateCourse).toHaveBeenCalledWith(
        request.prompt,
        request.level
      );
      expect(mockCourseRepository.save).toHaveBeenCalled();
      expect(mockEventBus.publish).toHaveBeenCalled();
    });

    it('should fail when AI service throws error', async () => {
      // Arrange
      const request: CreateCourseDto = {
        title: 'React for Beginners',
        description: 'Learn React from scratch',
        level: 'Beginner',
        prompt: 'Create a React course',
      };

      mockAIService.generateCourse.mockRejectedValue(
        new Error('AI service unavailable')
      );

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toContain('Failed to generate course');
      expect(mockCourseRepository.save).not.toHaveBeenCalled();
      expect(mockEventBus.publish).not.toHaveBeenCalled();
    });

    it('should fail when repository save throws error', async () => {
      // Arrange
      const request: CreateCourseDto = {
        title: 'React for Beginners',
        description: 'Learn React from scratch',
        level: 'Beginner',
        prompt: 'Create a React course',
      };

      const lesson = Lesson.create({
        title: 'Introduction',
        type: 'theory',
        content: 'Content',
        promptsForUser: ['Prompt'],
        expectedOutcome: 'Outcome',
      }).getValue();

      const module = Module.create({
        title: 'Module 1',
        learningObjectives: ['Learn'],
        lessons: [lesson],
      }).getValue();

      mockAIService.generateCourse.mockResolvedValue({
        title: request.title,
        description: request.description,
        level: request.level,
        modules: [module],
      });

      mockCourseRepository.save.mockRejectedValue(
        new Error('Database error')
      );

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toContain('Failed to save course');
      expect(mockEventBus.publish).not.toHaveBeenCalled();
    });

    it('should validate request data', async () => {
      // Arrange
      const request: CreateCourseDto = {
        title: 'R', // Too short
        description: 'Learn React from scratch',
        level: 'Beginner',
        prompt: 'Create a React course',
      };

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toContain('String must contain at least 3 character');
      expect(mockAIService.generateCourse).not.toHaveBeenCalled();
    });
  });
});