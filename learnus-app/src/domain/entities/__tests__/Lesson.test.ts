import { Lesson, LessonType } from '../Lesson';

describe('Lesson', () => {
  describe('create', () => {
    it('should create Lesson with valid theory type', () => {
      // Arrange
      const props = {
        title: 'Introduction to React',
        type: 'theory' as LessonType,
        content: 'React is a JavaScript library for building user interfaces',
        promptsForUser: ['What is React?', 'Why use React?'],
        expectedOutcome: 'Student understands what React is',
        hints: ['Think about component-based architecture'],
      };

      // Act
      const result = Lesson.create(props);

      // Assert
      expect(result.isSuccess).toBe(true);
      const lesson = result.getValue();
      expect(lesson.title).toBe('Introduction to React');
      expect(lesson.type).toBe('theory');
      expect(lesson.content).toBe(props.content);
      expect(lesson.promptsForUser).toEqual(props.promptsForUser);
      expect(lesson.expectedOutcome).toBe(props.expectedOutcome);
      expect(lesson.hints).toEqual(props.hints);
    });

    it('should create Lesson with valid exercise type', () => {
      // Arrange
      const props = {
        title: 'Create Your First Component',
        type: 'exercise' as LessonType,
        content: 'Create a simple React component that displays "Hello World"',
        promptsForUser: ['Create a functional component'],
        expectedOutcome: 'Student can create a basic React component',
      };

      // Act
      const result = Lesson.create(props);

      // Assert
      expect(result.isSuccess).toBe(true);
      const lesson = result.getValue();
      expect(lesson.type).toBe('exercise');
      expect(lesson.hints).toBeUndefined();
    });

    it('should fail with empty title', () => {
      // Arrange
      const props = {
        title: '',
        type: 'theory' as LessonType,
        content: 'Some content',
        promptsForUser: ['Some prompt'],
        expectedOutcome: 'Some outcome',
      };

      // Act
      const result = Lesson.create(props);

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toBe('Lesson title cannot be empty');
    });

    it('should fail with empty content', () => {
      // Arrange
      const props = {
        title: 'Some title',
        type: 'theory' as LessonType,
        content: '',
        promptsForUser: ['Some prompt'],
        expectedOutcome: 'Some outcome',
      };

      // Act
      const result = Lesson.create(props);

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toBe('Lesson content cannot be empty');
    });

    it('should fail with empty prompts', () => {
      // Arrange
      const props = {
        title: 'Some title',
        type: 'theory' as LessonType,
        content: 'Some content',
        promptsForUser: [],
        expectedOutcome: 'Some outcome',
      };

      // Act
      const result = Lesson.create(props);

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toBe('Lesson must have at least one prompt for user');
    });

    it('should fail with empty expected outcome', () => {
      // Arrange
      const props = {
        title: 'Some title',
        type: 'theory' as LessonType,
        content: 'Some content',
        promptsForUser: ['Some prompt'],
        expectedOutcome: '',
      };

      // Act
      const result = Lesson.create(props);

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toBe('Expected outcome cannot be empty');
    });

    it('should fail with invalid type', () => {
      // Arrange
      const props = {
        title: 'Some title',
        type: 'invalid' as LessonType,
        content: 'Some content',
        promptsForUser: ['Some prompt'],
        expectedOutcome: 'Some outcome',
      };

      // Act
      const result = Lesson.create(props);

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toBe('Invalid lesson type');
    });

    it('should create Lesson with existing id', () => {
      // Arrange
      const props = {
        title: 'Introduction to React',
        type: 'theory' as LessonType,
        content: 'React content',
        promptsForUser: ['What is React?'],
        expectedOutcome: 'Student understands React',
      };
      const id = 'existing-lesson-id';

      // Act
      const result = Lesson.create(props, id);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.getValue().id).toBe('existing-lesson-id');
    });
  });

  describe('isTheory', () => {
    it('should return true for theory lesson', () => {
      // Arrange
      const lesson = Lesson.create({
        title: 'Theory Lesson',
        type: 'theory',
        content: 'Content',
        promptsForUser: ['Prompt'],
        expectedOutcome: 'Outcome',
      }).getValue();

      // Act & Assert
      expect(lesson.isTheory()).toBe(true);
      expect(lesson.isExercise()).toBe(false);
    });
  });

  describe('isExercise', () => {
    it('should return true for exercise lesson', () => {
      // Arrange
      const lesson = Lesson.create({
        title: 'Exercise Lesson',
        type: 'exercise',
        content: 'Content',
        promptsForUser: ['Prompt'],
        expectedOutcome: 'Outcome',
      }).getValue();

      // Act & Assert
      expect(lesson.isExercise()).toBe(true);
      expect(lesson.isTheory()).toBe(false);
    });
  });

  describe('addHint', () => {
    it('should add hint to lesson', () => {
      // Arrange
      const lesson = Lesson.create({
        title: 'Lesson',
        type: 'theory',
        content: 'Content',
        promptsForUser: ['Prompt'],
        expectedOutcome: 'Outcome',
      }).getValue();

      // Act
      const result = lesson.addHint('New hint');

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(lesson.hints).toContain('New hint');
    });

    it('should fail to add empty hint', () => {
      // Arrange
      const lesson = Lesson.create({
        title: 'Lesson',
        type: 'theory',
        content: 'Content',
        promptsForUser: ['Prompt'],
        expectedOutcome: 'Outcome',
      }).getValue();

      // Act
      const result = lesson.addHint('');

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toBe('Hint cannot be empty');
    });
  });
});