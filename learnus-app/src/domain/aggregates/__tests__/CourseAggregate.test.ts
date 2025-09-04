import { CourseAggregate } from '../CourseAggregate';
import { CourseLevel } from '../../value-objects/CourseLevel';
import { Module } from '../../entities/Module';
import { Lesson } from '../../entities/Lesson';

describe('CourseAggregate', () => {
  const createValidLesson = (title: string) => {
    return Lesson.create({
      title,
      type: 'theory',
      content: 'Some content',
      promptsForUser: ['Some prompt'],
      expectedOutcome: 'Some outcome',
    }).getValue();
  };

  const createValidModule = (title: string) => {
    return Module.create({
      title,
      learningObjectives: ['Learn something'],
      lessons: [createValidLesson('Lesson 1')],
    }).getValue();
  };

  describe('create', () => {
    it('should create CourseAggregate with valid data', () => {
      // Arrange
      const props = {
        title: 'React Complete Course',
        description: 'Learn React from scratch',
        level: 'Beginner' as const,
        modules: [
          createValidModule('Introduction'),
          createValidModule('Components'),
        ],
      };

      // Act
      const result = CourseAggregate.create(props);

      // Assert
      expect(result.isSuccess).toBe(true);
      const course = result.getValue();
      expect(course.title.value).toBe('React Complete Course');
      expect(course.description).toBe('Learn React from scratch');
      expect(course.level.value).toBe('Beginner');
      expect(course.modules).toHaveLength(2);
    });

    it('should fail with invalid title', () => {
      // Arrange
      const props = {
        title: '',
        description: 'Learn React from scratch',
        level: 'Beginner' as const,
        modules: [createValidModule('Introduction')],
      };

      // Act
      const result = CourseAggregate.create(props);

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toContain('title');
    });

    it('should fail with empty description', () => {
      // Arrange
      const props = {
        title: 'React Course',
        description: '',
        level: 'Beginner' as const,
        modules: [createValidModule('Introduction')],
      };

      // Act
      const result = CourseAggregate.create(props);

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toBe('Course description cannot be empty');
    });

    it('should fail with no modules', () => {
      // Arrange
      const props = {
        title: 'React Course',
        description: 'Learn React',
        level: 'Beginner' as const,
        modules: [],
      };

      // Act
      const result = CourseAggregate.create(props);

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toBe('Course must have at least one module');
    });

    it('should create with existing id', () => {
      // Arrange
      const props = {
        title: 'React Course',
        description: 'Learn React',
        level: 'Beginner' as const,
        modules: [createValidModule('Introduction')],
      };
      const id = 'existing-course-id';

      // Act
      const result = CourseAggregate.create(props, id);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.getValue().id).toBe('existing-course-id');
    });
  });

  describe('canBeAccessedBy', () => {
    it('should allow access for appropriate user level', () => {
      // Arrange
      const course = CourseAggregate.create({
        title: 'React Course',
        description: 'Learn React',
        level: 'Intermediate',
        modules: [createValidModule('Introduction')],
      }).getValue();
      const userLevel = CourseLevel.create('Advanced').getValue();

      // Act
      const canAccess = course.canBeAccessedBy(userLevel);

      // Assert
      expect(canAccess).toBe(true);
    });

    it('should deny access for lower user level', () => {
      // Arrange
      const course = CourseAggregate.create({
        title: 'React Course',
        description: 'Learn React',
        level: 'Advanced',
        modules: [createValidModule('Introduction')],
      }).getValue();
      const userLevel = CourseLevel.create('Beginner').getValue();

      // Act
      const canAccess = course.canBeAccessedBy(userLevel);

      // Assert
      expect(canAccess).toBe(false);
    });
  });

  describe('addModule', () => {
    it('should add module to course', () => {
      // Arrange
      const course = CourseAggregate.create({
        title: 'React Course',
        description: 'Learn React',
        level: 'Beginner',
        modules: [createValidModule('Introduction')],
      }).getValue();
      const newModule = createValidModule('Advanced Topics');

      // Act
      course.addModule(newModule);

      // Assert
      expect(course.modules).toHaveLength(2);
      expect(course.modules[1]?.id).toBe(newModule.id);
    });
  });

  describe('removeModule', () => {
    it('should remove module from course', () => {
      // Arrange
      const module1 = createValidModule('Introduction');
      const module2 = createValidModule('Components');
      const course = CourseAggregate.create({
        title: 'React Course',
        description: 'Learn React',
        level: 'Beginner',
        modules: [module1, module2],
      }).getValue();

      // Act
      const result = course.removeModule(module1.id);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(course.modules).toHaveLength(1);
      expect(course.modules[0]?.id).toBe(module2.id);
    });

    it('should fail to remove last module', () => {
      // Arrange
      const module = createValidModule('Introduction');
      const course = CourseAggregate.create({
        title: 'React Course',
        description: 'Learn React',
        level: 'Beginner',
        modules: [module],
      }).getValue();

      // Act
      const result = course.removeModule(module.id);

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toBe('Course must have at least one module');
    });
  });

  describe('getModuleById', () => {
    it('should return module by id', () => {
      // Arrange
      const module1 = createValidModule('Introduction');
      const module2 = createValidModule('Components');
      const course = CourseAggregate.create({
        title: 'React Course',
        description: 'Learn React',
        level: 'Beginner',
        modules: [module1, module2],
      }).getValue();

      // Act
      const foundModule = course.getModuleById(module2.id);

      // Assert
      expect(foundModule).toBeDefined();
      expect(foundModule?.id).toBe(module2.id);
    });
  });

  describe('getTotalLessons', () => {
    it('should return total number of lessons across all modules', () => {
      // Arrange
      const module1 = Module.create({
        title: 'Module 1',
        learningObjectives: ['Learn something'],
        lessons: [
          createValidLesson('Lesson 1'),
          createValidLesson('Lesson 2'),
        ],
      }).getValue();
      const module2 = Module.create({
        title: 'Module 2',
        learningObjectives: ['Learn more'],
        lessons: [
          createValidLesson('Lesson 3'),
          createValidLesson('Lesson 4'),
          createValidLesson('Lesson 5'),
        ],
      }).getValue();
      const course = CourseAggregate.create({
        title: 'React Course',
        description: 'Learn React',
        level: 'Beginner',
        modules: [module1, module2],
      }).getValue();

      // Act
      const totalLessons = course.getTotalLessons();

      // Assert
      expect(totalLessons).toBe(5);
    });
  });

  describe('updateDescription', () => {
    it('should update course description', () => {
      // Arrange
      const course = CourseAggregate.create({
        title: 'React Course',
        description: 'Learn React',
        level: 'Beginner',
        modules: [createValidModule('Introduction')],
      }).getValue();

      // Act
      const result = course.updateDescription('Learn React from scratch to advanced');

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(course.description).toBe('Learn React from scratch to advanced');
    });

    it('should fail with empty description', () => {
      // Arrange
      const course = CourseAggregate.create({
        title: 'React Course',
        description: 'Learn React',
        level: 'Beginner',
        modules: [createValidModule('Introduction')],
      }).getValue();

      // Act
      const result = course.updateDescription('');

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toBe('Course description cannot be empty');
    });
  });
});