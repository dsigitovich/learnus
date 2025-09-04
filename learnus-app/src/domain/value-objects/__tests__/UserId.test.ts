import { UserId } from '../UserId';

describe('UserId', () => {
  describe('constructor', () => {
    it('should create valid UserId with correct UUID', () => {
      const validUuid = '550e8400-e29b-41d4-a716-446655440000';
      const userId = new UserId(validUuid);
      
      expect(userId.value).toBe(validUuid);
    });

    it('should throw error for empty value', () => {
      expect(() => new UserId('')).toThrow('UserId cannot be empty');
    });

    it('should throw error for invalid UUID format', () => {
      expect(() => new UserId('invalid-uuid')).toThrow('UserId must be a valid UUID');
      expect(() => new UserId('123')).toThrow('UserId must be a valid UUID');
    });
  });

  describe('generate', () => {
    it('should generate valid UUID', () => {
      const userId = UserId.generate();
      
      expect(userId).toBeInstanceOf(UserId);
      expect(userId.value).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    });

    it('should generate unique UUIDs', () => {
      const userId1 = UserId.generate();
      const userId2 = UserId.generate();
      
      expect(userId1.value).not.toBe(userId2.value);
    });
  });

  describe('equals', () => {
    it('should return true for same UUID', () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      const userId1 = new UserId(uuid);
      const userId2 = new UserId(uuid);
      
      expect(userId1.equals(userId2)).toBe(true);
    });

    it('should return false for different UUIDs', () => {
      const userId1 = new UserId('550e8400-e29b-41d4-a716-446655440000');
      const userId2 = new UserId('6ba7b810-9dad-11d1-80b4-00c04fd430c8');
      
      expect(userId1.equals(userId2)).toBe(false);
    });
  });
});