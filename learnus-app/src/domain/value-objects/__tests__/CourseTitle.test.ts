import { CourseTitle } from '../CourseTitle';

describe('CourseTitle', () => {
  describe('create', () => {
    it('should create CourseTitle with valid value', () => {
      // Arrange
      const value = 'React для начинающих';

      // Act
      const result = CourseTitle.create(value);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe('React для начинающих');
    });

    it('should fail with empty value', () => {
      // Arrange
      const value = '';

      // Act
      const result = CourseTitle.create(value);

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toBe('Course title cannot be empty');
    });

    it('should fail with only whitespace', () => {
      // Arrange
      const value = '   ';

      // Act
      const result = CourseTitle.create(value);

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toBe('Course title cannot be empty');
    });

    it('should fail with title too short', () => {
      // Arrange
      const value = 'JS';

      // Act
      const result = CourseTitle.create(value);

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toBe('Course title must be between 3 and 200 characters');
    });

    it('should fail with title too long', () => {
      // Arrange
      const value = 'a'.repeat(201);

      // Act
      const result = CourseTitle.create(value);

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toBe('Course title must be between 3 and 200 characters');
    });

    it('should trim whitespace', () => {
      // Arrange
      const value = '  React для начинающих  ';

      // Act
      const result = CourseTitle.create(value);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe('React для начинающих');
    });
  });

  describe('equals', () => {
    it('should return true for same values', () => {
      // Arrange
      const title1 = CourseTitle.create('React для начинающих').getValue();
      const title2 = CourseTitle.create('React для начинающих').getValue();

      // Act & Assert
      expect(title1.equals(title2)).toBe(true);
    });

    it('should return false for different values', () => {
      // Arrange
      const title1 = CourseTitle.create('React для начинающих').getValue();
      const title2 = CourseTitle.create('Vue для начинающих').getValue();

      // Act & Assert
      expect(title1.equals(title2)).toBe(false);
    });
  });
});