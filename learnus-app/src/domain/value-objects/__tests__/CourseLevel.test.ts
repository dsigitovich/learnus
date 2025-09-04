import { CourseLevel } from '../CourseLevel';

describe('CourseLevel', () => {
  describe('create', () => {
    it('should create CourseLevel with valid value "Beginner"', () => {
      // Arrange
      const value = 'Beginner';

      // Act
      const result = CourseLevel.create(value);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe('Beginner');
    });

    it('should create CourseLevel with valid value "Intermediate"', () => {
      // Arrange
      const value = 'Intermediate';

      // Act
      const result = CourseLevel.create(value);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe('Intermediate');
    });

    it('should create CourseLevel with valid value "Advanced"', () => {
      // Arrange
      const value = 'Advanced';

      // Act
      const result = CourseLevel.create(value);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe('Advanced');
    });

    it('should fail with invalid value', () => {
      // Arrange
      const value = 'Expert';

      // Act
      const result = CourseLevel.create(value);

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toBe('Invalid course level. Must be Beginner, Intermediate, or Advanced');
    });

    it('should fail with empty value', () => {
      // Arrange
      const value = '';

      // Act
      const result = CourseLevel.create(value);

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toBe('Course level cannot be empty');
    });
  });

  describe('canAccess', () => {
    it('should allow Beginner to access Beginner level', () => {
      // Arrange
      const userLevel = CourseLevel.create('Beginner').getValue();
      const courseLevel = CourseLevel.create('Beginner').getValue();

      // Act
      const canAccess = courseLevel.canAccess(userLevel);

      // Assert
      expect(canAccess).toBe(true);
    });

    it('should not allow Beginner to access Intermediate level', () => {
      // Arrange
      const userLevel = CourseLevel.create('Beginner').getValue();
      const courseLevel = CourseLevel.create('Intermediate').getValue();

      // Act
      const canAccess = courseLevel.canAccess(userLevel);

      // Assert
      expect(canAccess).toBe(false);
    });

    it('should allow Advanced to access any level', () => {
      // Arrange
      const userLevel = CourseLevel.create('Advanced').getValue();
      const beginnerCourse = CourseLevel.create('Beginner').getValue();
      const intermediateCourse = CourseLevel.create('Intermediate').getValue();
      const advancedCourse = CourseLevel.create('Advanced').getValue();

      // Act & Assert
      expect(beginnerCourse.canAccess(userLevel)).toBe(true);
      expect(intermediateCourse.canAccess(userLevel)).toBe(true);
      expect(advancedCourse.canAccess(userLevel)).toBe(true);
    });
  });

  describe('equals', () => {
    it('should return true for same values', () => {
      // Arrange
      const level1 = CourseLevel.create('Beginner').getValue();
      const level2 = CourseLevel.create('Beginner').getValue();

      // Act & Assert
      expect(level1.equals(level2)).toBe(true);
    });

    it('should return false for different values', () => {
      // Arrange
      const level1 = CourseLevel.create('Beginner').getValue();
      const level2 = CourseLevel.create('Advanced').getValue();

      // Act & Assert
      expect(level1.equals(level2)).toBe(false);
    });
  });
});