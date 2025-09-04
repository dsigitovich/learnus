import { Email } from '../Email';

describe('Email', () => {
  describe('create', () => {
    it('should create Email with valid value', () => {
      // Arrange
      const value = 'user@example.com';

      // Act
      const result = Email.create(value);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe('user@example.com');
    });

    it('should fail with empty value', () => {
      // Arrange
      const value = '';

      // Act
      const result = Email.create(value);

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toBe('Email cannot be empty');
    });

    it('should fail with invalid format - no @', () => {
      // Arrange
      const value = 'userexample.com';

      // Act
      const result = Email.create(value);

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toBe('Invalid email format');
    });

    it('should fail with invalid format - no domain', () => {
      // Arrange
      const value = 'user@';

      // Act
      const result = Email.create(value);

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toBe('Invalid email format');
    });

    it('should fail with invalid format - no local part', () => {
      // Arrange
      const value = '@example.com';

      // Act
      const result = Email.create(value);

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toBe('Invalid email format');
    });

    it('should convert to lowercase', () => {
      // Arrange
      const value = 'User@EXAMPLE.COM';

      // Act
      const result = Email.create(value);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe('user@example.com');
    });

    it('should trim whitespace', () => {
      // Arrange
      const value = '  user@example.com  ';

      // Act
      const result = Email.create(value);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe('user@example.com');
    });
  });

  describe('equals', () => {
    it('should return true for same emails', () => {
      // Arrange
      const email1 = Email.create('user@example.com').getValue();
      const email2 = Email.create('user@example.com').getValue();

      // Act & Assert
      expect(email1.equals(email2)).toBe(true);
    });

    it('should return true for same emails with different case', () => {
      // Arrange
      const email1 = Email.create('user@example.com').getValue();
      const email2 = Email.create('USER@EXAMPLE.COM').getValue();

      // Act & Assert
      expect(email1.equals(email2)).toBe(true);
    });

    it('should return false for different emails', () => {
      // Arrange
      const email1 = Email.create('user1@example.com').getValue();
      const email2 = Email.create('user2@example.com').getValue();

      // Act & Assert
      expect(email1.equals(email2)).toBe(false);
    });
  });
});