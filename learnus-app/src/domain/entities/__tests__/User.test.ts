import { User } from '../User';
import { CourseLevel } from '../../value-objects/CourseLevel';

describe('User', () => {
  describe('create', () => {
    it('should create User with valid data', () => {
      // Arrange
      const props = {
        email: 'user@example.com',
        name: 'Test User',
        level: 'Beginner' as const,
      };

      // Act
      const result = User.create(props);

      // Assert
      expect(result.isSuccess).toBe(true);
      const user = result.getValue();
      expect(user.email.value).toBe('user@example.com');
      expect(user.name).toBe('Test User');
      expect(user.level.value).toBe('Beginner');
    });

    it('should fail with invalid email', () => {
      // Arrange
      const props = {
        email: 'invalid-email',
        name: 'Test User',
        level: 'Beginner' as const,
      };

      // Act
      const result = User.create(props);

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toContain('email');
    });

    it('should fail with empty name', () => {
      // Arrange
      const props = {
        email: 'user@example.com',
        name: '',
        level: 'Beginner' as const,
      };

      // Act
      const result = User.create(props);

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toBe('Name cannot be empty');
    });

    it('should fail with invalid level', () => {
      // Arrange
      const props = {
        email: 'user@example.com',
        name: 'Test User',
        level: 'Expert' as any,
      };

      // Act
      const result = User.create(props);

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toContain('level');
    });

    it('should create User with existing id', () => {
      // Arrange
      const props = {
        email: 'user@example.com',
        name: 'Test User',
        level: 'Beginner' as const,
      };
      const id = 'existing-id';

      // Act
      const result = User.create(props, id);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.getValue().id).toBe('existing-id');
    });
  });

  describe('updateLevel', () => {
    it('should update user level', () => {
      // Arrange
      const user = User.create({
        email: 'user@example.com',
        name: 'Test User',
        level: 'Beginner',
      }).getValue();
      const newLevel = CourseLevel.create('Intermediate').getValue();

      // Act
      user.updateLevel(newLevel);

      // Assert
      expect(user.level.value).toBe('Intermediate');
    });
  });

  describe('updateName', () => {
    it('should update user name', () => {
      // Arrange
      const user = User.create({
        email: 'user@example.com',
        name: 'Test User',
        level: 'Beginner',
      }).getValue();

      // Act
      const result = user.updateName('New Name');

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(user.name).toBe('New Name');
    });

    it('should fail with empty name', () => {
      // Arrange
      const user = User.create({
        email: 'user@example.com',
        name: 'Test User',
        level: 'Beginner',
      }).getValue();

      // Act
      const result = user.updateName('');

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toBe('Name cannot be empty');
    });
  });

  describe('canAccessCourse', () => {
    it('should allow access to course with same or lower level', () => {
      // Arrange
      const user = User.create({
        email: 'user@example.com',
        name: 'Test User',
        level: 'Intermediate',
      }).getValue();
      const beginnerLevel = CourseLevel.create('Beginner').getValue();
      const intermediateLevel = CourseLevel.create('Intermediate').getValue();

      // Act & Assert
      expect(user.canAccessCourse(beginnerLevel)).toBe(true);
      expect(user.canAccessCourse(intermediateLevel)).toBe(true);
    });

    it('should deny access to course with higher level', () => {
      // Arrange
      const user = User.create({
        email: 'user@example.com',
        name: 'Test User',
        level: 'Beginner',
      }).getValue();
      const advancedLevel = CourseLevel.create('Advanced').getValue();

      // Act & Assert
      expect(user.canAccessCourse(advancedLevel)).toBe(false);
    });
  });
});