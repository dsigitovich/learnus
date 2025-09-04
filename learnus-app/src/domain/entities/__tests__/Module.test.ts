import { Module } from '../Module';
import { Lesson } from '../Lesson';

describe('Module', () => {
  const createValidLesson = (title: string) => {
    return Lesson.create({
      title,
      type: 'theory',
      content: 'Some content',
      promptsForUser: ['Some prompt'],
      expectedOutcome: 'Some outcome',
    }).getValue();
  };

  describe('create', () => {
    it('should create Module with valid data', () => {
      // Arrange
      const props = {
        title: 'React Basics',
        learningObjectives: [
          'Understand React components',
          'Learn about props and state',
        ],
        lessons: [
          createValidLesson('Introduction to React'),
          createValidLesson('Components and Props'),
        ],
      };

      // Act
      const result = Module.create(props);

      // Assert
      expect(result.isSuccess).toBe(true);
      const newModule = result.getValue();
      expect(newModule.title).toBe('React Basics');
      expect(newModule.learningObjectives).toEqual(props.learningObjectives);
      expect(newModule.lessons).toHaveLength(2);
    });

    it('should fail with empty title', () => {
      // Arrange
      const props = {
        title: '',
        learningObjectives: ['Some objective'],
        lessons: [createValidLesson('Lesson 1')],
      };

      // Act
      const result = Module.create(props);

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toBe('Module title cannot be empty');
    });

    it('should fail with no learning objectives', () => {
      // Arrange
      const props = {
        title: 'React Basics',
        learningObjectives: [],
        lessons: [createValidLesson('Lesson 1')],
      };

      // Act
      const result = Module.create(props);

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toBe('Module must have at least one learning objective');
    });

    it('should fail with no lessons', () => {
      // Arrange
      const props = {
        title: 'React Basics',
        learningObjectives: ['Some objective'],
        lessons: [],
      };

      // Act
      const result = Module.create(props);

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toBe('Module must have at least one lesson');
    });

    it('should create Module with existing id', () => {
      // Arrange
      const props = {
        title: 'React Basics',
        learningObjectives: ['Some objective'],
        lessons: [createValidLesson('Lesson 1')],
      };
      const id = 'existing-module-id';

      // Act
      const result = Module.create(props, id);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.getValue().id).toBe('existing-module-id');
    });
  });

  describe('addLesson', () => {
    it('should add lesson to module', () => {
      // Arrange
      const newModule = Module.create({
        title: 'React Basics',
        learningObjectives: ['Some objective'],
        lessons: [createValidLesson('Lesson 1')],
      }).getValue();
      const newLesson = createValidLesson('Lesson 2');

      // Act
      newModule.addLesson(newLesson);

      // Assert
      expect(newModule.lessons).toHaveLength(2);
      expect(newModule.lessons[1]?.id).toBe(newLesson.id);
    });
  });

  describe('removeLesson', () => {
    it('should remove lesson from module', () => {
      // Arrange
      const lesson1 = createValidLesson('Lesson 1');
      const lesson2 = createValidLesson('Lesson 2');
      const newModule = Module.create({
        title: 'React Basics',
        learningObjectives: ['Some objective'],
        lessons: [lesson1, lesson2],
      }).getValue();

      // Act
      const result = newModule.removeLesson(lesson1.id);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(newModule.lessons).toHaveLength(1);
      expect(newModule.lessons[0]?.id).toBe(lesson2.id);
    });

    it('should fail to remove last lesson', () => {
      // Arrange
      const lesson = createValidLesson('Lesson 1');
      const newModule = Module.create({
        title: 'React Basics',
        learningObjectives: ['Some objective'],
        lessons: [lesson],
      }).getValue();

      // Act
      const result = newModule.removeLesson(lesson.id);

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toBe('Module must have at least one lesson');
    });

    it('should fail to remove non-existing lesson', () => {
      // Arrange
      const newModule = Module.create({
        title: 'React Basics',
        learningObjectives: ['Some objective'],
        lessons: [createValidLesson('Lesson 1')],
      }).getValue();

      // Act
      const result = newModule.removeLesson('non-existing-id');

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toBe('Lesson not found in module');
    });
  });

  describe('getLessonById', () => {
    it('should return lesson by id', () => {
      // Arrange
      const lesson1 = createValidLesson('Lesson 1');
      const lesson2 = createValidLesson('Lesson 2');
      const newModule = Module.create({
        title: 'React Basics',
        learningObjectives: ['Some objective'],
        lessons: [lesson1, lesson2],
      }).getValue();

      // Act
      const foundLesson = newModule.getLessonById(lesson2.id);

      // Assert
      expect(foundLesson).toBeDefined();
      expect(foundLesson?.id).toBe(lesson2.id);
    });

    it('should return undefined for non-existing lesson', () => {
      // Arrange
      const newModule = Module.create({
        title: 'React Basics',
        learningObjectives: ['Some objective'],
        lessons: [createValidLesson('Lesson 1')],
      }).getValue();

      // Act
      const foundLesson = newModule.getLessonById('non-existing-id');

      // Assert
      expect(foundLesson).toBeUndefined();
    });
  });

  describe('getTotalLessons', () => {
    it('should return total number of lessons', () => {
      // Arrange
      const newModule = Module.create({
        title: 'React Basics',
        learningObjectives: ['Some objective'],
        lessons: [
          createValidLesson('Lesson 1'),
          createValidLesson('Lesson 2'),
          createValidLesson('Lesson 3'),
        ],
      }).getValue();

      // Act & Assert
      expect(newModule.getTotalLessons()).toBe(3);
    });
  });
});