import { UserId } from '../UserId';

describe('UserId', () => {
  describe('create', () => {
    it('should create UserId with valid UUID', () => {
      // Arrange
      const validUuid = '550e8400-e29b-41d4-a716-446655440000';
      
      // Act
      const result = UserId.create(validUuid);
      
      // Assert
      expect(result.isSuccess).toBe(true);
      const userId = result.getValue();
      expect(userId.toString()).toBe(validUuid);
    });

    it('should fail with short string', () => {
      // Arrange
      const shortString = 'ab';
      
      // Act
      const result = UserId.create(shortString);
      
      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toBe('UserId must be at least 3 characters long');
    });

    it('should fail with empty string', () => {
      // Arrange
      const emptyString = '';
      
      // Act
      const result = UserId.create(emptyString);
      
      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toBe('UserId cannot be empty');
    });
  });
});