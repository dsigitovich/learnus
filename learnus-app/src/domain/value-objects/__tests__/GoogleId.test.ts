import { GoogleId } from '../GoogleId';

describe('GoogleId', () => {
  describe('constructor', () => {
    it('should create valid GoogleId with numeric string', () => {
      const validGoogleId = '12345678901234567890';
      const googleId = new GoogleId(validGoogleId);
      
      expect(googleId.value).toBe(validGoogleId);
    });

    it('should throw error for empty value', () => {
      expect(() => new GoogleId('')).toThrow('GoogleId cannot be empty');
      expect(() => new GoogleId('  ')).toThrow('GoogleId cannot be empty');
    });

    it('should throw error for non-numeric string', () => {
      expect(() => new GoogleId('abc123')).toThrow('GoogleId must be a numeric string');
      expect(() => new GoogleId('123-456')).toThrow('GoogleId must be a numeric string');
      expect(() => new GoogleId('12.34')).toThrow('GoogleId must be a numeric string');
    });
  });

  describe('equals', () => {
    it('should return true for same Google ID', () => {
      const id = '12345678901234567890';
      const googleId1 = new GoogleId(id);
      const googleId2 = new GoogleId(id);
      
      expect(googleId1.equals(googleId2)).toBe(true);
    });

    it('should return false for different Google IDs', () => {
      const googleId1 = new GoogleId('12345678901234567890');
      const googleId2 = new GoogleId('09876543210987654321');
      
      expect(googleId1.equals(googleId2)).toBe(false);
    });
  });
});