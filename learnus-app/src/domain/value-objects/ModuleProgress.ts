import { Result } from '@shared/types/result';

interface ModuleProgressProps {
  completedLessons: number;
  totalLessons: number;
  completionPercentage: number;
  isCompleted: boolean;
  totalTimeSpent: number; // в секундах
}

export class ModuleProgress {
  protected readonly props: ModuleProgressProps;
  get completedLessons(): number {
    return this.props.completedLessons;
  }

  get totalLessons(): number {
    return this.props.totalLessons;
  }

  get completionPercentage(): number {
    return this.props.completionPercentage;
  }

  get isCompleted(): boolean {
    return this.props.isCompleted;
  }

  get totalTimeSpent(): number {
    return this.props.totalTimeSpent;
  }

  private constructor(props: ModuleProgressProps) {
    this.props = props;
  }

  public static create(props: ModuleProgressProps): Result<ModuleProgress> {
    // Validate completed lessons
    if (props.completedLessons < 0) {
      return Result.fail(new Error('Completed lessons cannot be negative'));
    }

    if (props.completedLessons > props.totalLessons) {
      return Result.fail(new Error('Completed lessons cannot exceed total lessons'));
    }

    // Validate total lessons
    if (props.totalLessons <= 0) {
      return Result.fail(new Error('Total lessons must be greater than 0'));
    }

    // Validate completion percentage
    if (props.completionPercentage < 0 || props.completionPercentage > 100) {
      return Result.fail(new Error('Completion percentage must be between 0 and 100'));
    }

    // Validate total time spent
    if (props.totalTimeSpent < 0) {
      return Result.fail(new Error('Total time spent cannot be negative'));
    }

    const moduleProgress = new ModuleProgress(props);
    return Result.ok(moduleProgress);
  }

  public static calculateFromLessons(
    completedLessons: number,
    totalLessons: number,
    totalTimeSpent: number
  ): Result<ModuleProgress> {
    if (totalLessons <= 0) {
      return Result.fail(new Error('Total lessons must be greater than 0'));
    }

    if (completedLessons < 0) {
      return Result.fail(new Error('Completed lessons cannot be negative'));
    }

    if (completedLessons > totalLessons) {
      return Result.fail(new Error('Completed lessons cannot exceed total lessons'));
    }

    if (totalTimeSpent < 0) {
      return Result.fail(new Error('Total time spent cannot be negative'));
    }

    const completionPercentage = Math.round((completedLessons / totalLessons) * 100 * 100) / 100; // Round to 2 decimal places
    const isCompleted = completedLessons === totalLessons;

    return ModuleProgress.create({
      completedLessons,
      totalLessons,
      completionPercentage,
      isCompleted,
      totalTimeSpent,
    });
  }

  public getRemainingLessons(): number {
    return this.props.totalLessons - this.props.completedLessons;
  }

  public getFormattedTimeSpent(): string {
    const totalSeconds = this.props.totalTimeSpent;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    if (totalSeconds === 0) {
      return '0m';
    }

    if (hours > 0 && minutes > 0) {
      return `${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${minutes}m`;
    }
  }

  public getEstimatedTimeRemaining(averageTimePerLesson: number): string {
    const remainingLessons = this.getRemainingLessons();
    const estimatedSeconds = remainingLessons * averageTimePerLesson;
    
    const hours = Math.floor(estimatedSeconds / 3600);
    const minutes = Math.floor((estimatedSeconds % 3600) / 60);

    if (estimatedSeconds === 0) {
      return '0m';
    }

    if (hours > 0 && minutes > 0) {
      return `${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${minutes}m`;
    }
  }

  public getDurationInMinutes(): number {
    return Math.round(this.props.totalTimeSpent / 60);
  }

  public getAverageTimePerCompletedLesson(): number {
    if (this.props.completedLessons === 0) {
      return 0;
    }
    return this.props.totalTimeSpent / this.props.completedLessons;
  }

  public getProgressLevel(): 'not_started' | 'beginner' | 'intermediate' | 'advanced' | 'completed' {
    if (this.props.completionPercentage === 0) {
      return 'not_started';
    } else if (this.props.completionPercentage === 100) {
      return 'completed';
    } else if (this.props.completionPercentage < 25) {
      return 'beginner';
    } else if (this.props.completionPercentage < 75) {
      return 'intermediate';
    } else {
      return 'advanced';
    }
  }
}