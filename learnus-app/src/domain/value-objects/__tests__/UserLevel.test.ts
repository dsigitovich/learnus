import { UserLevel } from '../UserLevel';

describe('UserLevel', () => {
  describe('constructor', () => {
    it('should create valid UserLevel for all valid levels', () => {
      const beginner = new UserLevel('Beginner');
      const intermediate = new UserLevel('Intermediate');
      const advanced = new UserLevel('Advanced');
      
      expect(beginner.value).toBe('Beginner');
      expect(intermediate.value).toBe('Intermediate');
      expect(advanced.value).toBe('Advanced');
    });

    it('should throw error for invalid level', () => {
      expect(() => new UserLevel('Expert' as any)).toThrow('Invalid user level: Expert');
      expect(() => new UserLevel('Novice' as any)).toThrow('Invalid user level: Novice');
    });
  });

  describe('factory methods', () => {
    it('should create Beginner level', () => {
      const level = UserLevel.createBeginner();
      expect(level.value).toBe('Beginner');
    });

    it('should create Intermediate level', () => {
      const level = UserLevel.createIntermediate();
      expect(level.value).toBe('Intermediate');
    });

    it('should create Advanced level', () => {
      const level = UserLevel.createAdvanced();
      expect(level.value).toBe('Advanced');
    });
  });

  describe('canAccessCourseLevel', () => {
    it('should allow Beginner to access Beginner courses', () => {
      const userLevel = UserLevel.createBeginner();
      const courseLevel = UserLevel.createBeginner();
      
      expect(userLevel.canAccessCourseLevel(courseLevel)).toBe(true);
    });

    it('should not allow Beginner to access Intermediate courses', () => {
      const userLevel = UserLevel.createBeginner();
      const courseLevel = UserLevel.createIntermediate();
      
      expect(userLevel.canAccessCourseLevel(courseLevel)).toBe(false);
    });

    it('should not allow Beginner to access Advanced courses', () => {
      const userLevel = UserLevel.createBeginner();
      const courseLevel = UserLevel.createAdvanced();
      
      expect(userLevel.canAccessCourseLevel(courseLevel)).toBe(false);
    });

    it('should allow Intermediate to access Beginner and Intermediate courses', () => {
      const userLevel = UserLevel.createIntermediate();
      const beginnerCourse = UserLevel.createBeginner();
      const intermediateCourse = UserLevel.createIntermediate();
      
      expect(userLevel.canAccessCourseLevel(beginnerCourse)).toBe(true);
      expect(userLevel.canAccessCourseLevel(intermediateCourse)).toBe(true);
    });

    it('should not allow Intermediate to access Advanced courses', () => {
      const userLevel = UserLevel.createIntermediate();
      const courseLevel = UserLevel.createAdvanced();
      
      expect(userLevel.canAccessCourseLevel(courseLevel)).toBe(false);
    });

    it('should allow Advanced to access all course levels', () => {
      const userLevel = UserLevel.createAdvanced();
      const beginnerCourse = UserLevel.createBeginner();
      const intermediateCourse = UserLevel.createIntermediate();
      const advancedCourse = UserLevel.createAdvanced();
      
      expect(userLevel.canAccessCourseLevel(beginnerCourse)).toBe(true);
      expect(userLevel.canAccessCourseLevel(intermediateCourse)).toBe(true);
      expect(userLevel.canAccessCourseLevel(advancedCourse)).toBe(true);
    });
  });

  describe('equals', () => {
    it('should return true for same level', () => {
      const level1 = UserLevel.createBeginner();
      const level2 = UserLevel.createBeginner();
      
      expect(level1.equals(level2)).toBe(true);
    });

    it('should return false for different levels', () => {
      const level1 = UserLevel.createBeginner();
      const level2 = UserLevel.createIntermediate();
      
      expect(level1.equals(level2)).toBe(false);
    });
  });
});