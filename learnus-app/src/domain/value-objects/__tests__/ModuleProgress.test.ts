import { ModuleProgress } from '../ModuleProgress';

describe('ModuleProgress', () => {
  describe('create', () => {
    it('should create module progress with valid data', () => {
      // Arrange
      const props = {
        completedLessons: 2,
        totalLessons: 5,
        completionPercentage: 40.0,
        isCompleted: false,
        totalTimeSpent: 3600, // 1 hour
      };
      
      // Act
      const result = ModuleProgress.create(props);
      
      // Assert
      expect(result.isSuccess).toBe(true);
      const moduleProgress = result.getValue();
      expect(moduleProgress.completedLessons).toBe(2);
      expect(moduleProgress.totalLessons).toBe(5);
      expect(moduleProgress.completionPercentage).toBe(40.0);
      expect(moduleProgress.isCompleted).toBe(false);
      expect(moduleProgress.totalTimeSpent).toBe(3600);
    });

    it('should fail when completed lessons exceed total lessons', () => {
      // Arrange
      const props = {
        completedLessons: 6,
        totalLessons: 5,
        completionPercentage: 120.0,
        isCompleted: false,
        totalTimeSpent: 3600,
      };
      
      // Act
      const result = ModuleProgress.create(props);
      
      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toBe('Completed lessons cannot exceed total lessons');
    });

    it('should fail when total lessons is zero or negative', () => {
      // Arrange
      const props = {
        completedLessons: 0,
        totalLessons: 0,
        completionPercentage: 0,
        isCompleted: false,
        totalTimeSpent: 0,
      };
      
      // Act
      const result = ModuleProgress.create(props);
      
      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toBe('Total lessons must be greater than 0');
    });

    it('should fail when completion percentage is invalid', () => {
      // Arrange
      const props = {
        completedLessons: 2,
        totalLessons: 5,
        completionPercentage: 150.0,
        isCompleted: false,
        totalTimeSpent: 3600,
      };
      
      // Act
      const result = ModuleProgress.create(props);
      
      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toBe('Completion percentage must be between 0 and 100');
    });

    it('should fail when total time spent is negative', () => {
      // Arrange
      const props = {
        completedLessons: 2,
        totalLessons: 5,
        completionPercentage: 40.0,
        isCompleted: false,
        totalTimeSpent: -100,
      };
      
      // Act
      const result = ModuleProgress.create(props);
      
      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toBe('Total time spent cannot be negative');
    });
  });

  describe('calculateFromLessons', () => {
    it('should calculate module progress from lesson data', () => {
      // Arrange
      const completedLessons = 3;
      const totalLessons = 8;
      const totalTimeSpent = 7200; // 2 hours
      
      // Act
      const result = ModuleProgress.calculateFromLessons(
        completedLessons,
        totalLessons,
        totalTimeSpent
      );
      
      // Assert
      expect(result.isSuccess).toBe(true);
      const moduleProgress = result.getValue();
      expect(moduleProgress.completedLessons).toBe(3);
      expect(moduleProgress.totalLessons).toBe(8);
      expect(moduleProgress.completionPercentage).toBe(37.5);
      expect(moduleProgress.isCompleted).toBe(false);
      expect(moduleProgress.totalTimeSpent).toBe(7200);
    });

    it('should mark as completed when all lessons are done', () => {
      // Arrange
      const completedLessons = 5;
      const totalLessons = 5;
      const totalTimeSpent = 9000; // 2.5 hours
      
      // Act
      const result = ModuleProgress.calculateFromLessons(
        completedLessons,
        totalLessons,
        totalTimeSpent
      );
      
      // Assert
      expect(result.isSuccess).toBe(true);
      const moduleProgress = result.getValue();
      expect(moduleProgress.completedLessons).toBe(5);
      expect(moduleProgress.totalLessons).toBe(5);
      expect(moduleProgress.completionPercentage).toBe(100);
      expect(moduleProgress.isCompleted).toBe(true);
      expect(moduleProgress.totalTimeSpent).toBe(9000);
    });

    it('should handle zero completed lessons', () => {
      // Arrange
      const completedLessons = 0;
      const totalLessons = 4;
      const totalTimeSpent = 0;
      
      // Act
      const result = ModuleProgress.calculateFromLessons(
        completedLessons,
        totalLessons,
        totalTimeSpent
      );
      
      // Assert
      expect(result.isSuccess).toBe(true);
      const moduleProgress = result.getValue();
      expect(moduleProgress.completedLessons).toBe(0);
      expect(moduleProgress.totalLessons).toBe(4);
      expect(moduleProgress.completionPercentage).toBe(0);
      expect(moduleProgress.isCompleted).toBe(false);
      expect(moduleProgress.totalTimeSpent).toBe(0);
    });
  });

  describe('getFormattedTimeSpent', () => {
    it('should format time correctly for hours and minutes', () => {
      // Arrange
      const moduleProgress = ModuleProgress.create({
        completedLessons: 2,
        totalLessons: 5,
        completionPercentage: 40.0,
        isCompleted: false,
        totalTimeSpent: 5400, // 1 hour 30 minutes
      }).getValue();
      
      // Act
      const formattedTime = moduleProgress.getFormattedTimeSpent();
      
      // Assert
      expect(formattedTime).toBe('1h 30m');
    });

    it('should format time correctly for minutes only', () => {
      // Arrange
      const moduleProgress = ModuleProgress.create({
        completedLessons: 1,
        totalLessons: 5,
        completionPercentage: 20.0,
        isCompleted: false,
        totalTimeSpent: 1800, // 30 minutes
      }).getValue();
      
      // Act
      const formattedTime = moduleProgress.getFormattedTimeSpent();
      
      // Assert
      expect(formattedTime).toBe('30m');
    });

    it('should format time correctly for hours only', () => {
      // Arrange
      const moduleProgress = ModuleProgress.create({
        completedLessons: 3,
        totalLessons: 5,
        completionPercentage: 60.0,
        isCompleted: false,
        totalTimeSpent: 7200, // 2 hours
      }).getValue();
      
      // Act
      const formattedTime = moduleProgress.getFormattedTimeSpent();
      
      // Assert
      expect(formattedTime).toBe('2h');
    });

    it('should handle zero time', () => {
      // Arrange
      const moduleProgress = ModuleProgress.create({
        completedLessons: 0,
        totalLessons: 5,
        completionPercentage: 0,
        isCompleted: false,
        totalTimeSpent: 0,
      }).getValue();
      
      // Act
      const formattedTime = moduleProgress.getFormattedTimeSpent();
      
      // Assert
      expect(formattedTime).toBe('0m');
    });
  });
});