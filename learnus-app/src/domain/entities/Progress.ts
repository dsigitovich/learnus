import { Entity } from '@shared/types/entity';
import { Result } from '@shared/types/result';
import { UserId } from '../value-objects/UserId';
import { LessonProgress, LessonProgressStatus } from '../value-objects/LessonProgress';
import { ModuleProgress } from '../value-objects/ModuleProgress';

interface ProgressProps {
  userId: UserId;
  moduleId: string;
  lessonProgresses: LessonProgress[];
  startedAt: Date;
  lastAccessedAt?: Date;
  completedAt?: Date;
}

interface ProgressCreateProps {
  userId: UserId;
  moduleId: string;
  lessonProgresses: LessonProgress[];
  startedAt: Date;
  lastAccessedAt?: Date;
  completedAt?: Date;
}

export class Progress extends Entity<ProgressProps> {
  get userId(): UserId {
    return this.props.userId;
  }

  get moduleId(): string {
    return this.props.moduleId;
  }

  get lessonProgresses(): LessonProgress[] {
    return this.props.lessonProgresses;
  }

  get startedAt(): Date {
    return this.props.startedAt;
  }

  get lastAccessedAt(): Date | undefined {
    return this.props.lastAccessedAt;
  }

  get completedAt(): Date | undefined {
    return this.props.completedAt;
  }

  private constructor(props: ProgressProps, id?: string) {
    super(props, id);
  }

  public static create(props: ProgressCreateProps, id?: string): Result<Progress> {
    // Validate module ID
    if (!props.moduleId || props.moduleId.trim() === '') {
      return Result.fail(new Error('Module ID cannot be empty'));
    }

    // Validate lesson progresses array
    if (!props.lessonProgresses) {
      return Result.fail(new Error('Lesson progresses array is required'));
    }

    const progress = new Progress(
      {
        userId: props.userId,
        moduleId: props.moduleId.trim(),
        lessonProgresses: props.lessonProgresses,
        startedAt: props.startedAt,
        lastAccessedAt: props.lastAccessedAt,
        completedAt: props.completedAt,
      },
      id
    );

    return Result.ok(progress);
  }

  public addLessonProgress(lessonProgress: LessonProgress): Result<void> {
    // Check if lesson progress already exists
    const existingProgress = this.props.lessonProgresses.find(
      lp => lp.lessonId === lessonProgress.lessonId
    );

    if (existingProgress) {
      return Result.fail(new Error('Lesson progress already exists for this lesson'));
    }

    this.props.lessonProgresses.push(lessonProgress);
    this.updateLastAccessedAt();
    return Result.ok();
  }

  public updateLessonProgress(updatedLessonProgress: LessonProgress): Result<void> {
    const index = this.props.lessonProgresses.findIndex(
      lp => lp.lessonId === updatedLessonProgress.lessonId
    );

    if (index === -1) {
      return Result.fail(new Error('Lesson progress not found'));
    }

    this.props.lessonProgresses[index] = updatedLessonProgress;
    this.updateLastAccessedAt();
    
    // Check if module is completed
    this.checkAndUpdateModuleCompletion();
    
    return Result.ok();
  }

  public getLessonProgress(lessonId: string): LessonProgress | undefined {
    return this.props.lessonProgresses.find(lp => lp.lessonId === lessonId);
  }

  public calculateModuleProgress(totalLessons: number): ModuleProgress {
    const completedLessons = this.props.lessonProgresses.filter(lp => 
      lp.isCompleted()
    ).length;

    const totalTimeSpent = this.getTotalTimeSpent();

    const result = ModuleProgress.calculateFromLessons(
      completedLessons,
      totalLessons,
      totalTimeSpent
    );

    if (result.isFailure) {
      // Fallback to basic progress
      return ModuleProgress.create({
        completedLessons: 0,
        totalLessons: Math.max(totalLessons, 1),
        completionPercentage: 0,
        isCompleted: false,
        totalTimeSpent: 0,
      }).getValue();
    }

    return result.getValue();
  }

  public getTotalTimeSpent(): number {
    return this.props.lessonProgresses.reduce(
      (total, lessonProgress) => total + lessonProgress.timeSpent,
      0
    );
  }

  public getCompletedLessonsCount(): number {
    return this.props.lessonProgresses.filter(lp => lp.isCompleted()).length;
  }

  public getInProgressLessonsCount(): number {
    return this.props.lessonProgresses.filter(lp => lp.isInProgress()).length;
  }

  public getNotStartedLessonsCount(totalLessons: number): number {
    return totalLessons - this.props.lessonProgresses.length;
  }

  public isModuleCompleted(totalLessons: number): boolean {
    return this.getCompletedLessonsCount() === totalLessons;
  }

  public getNextLessonToStart(allLessonIds: string[]): string | undefined {
    // Find first lesson that hasn't been started yet
    for (const lessonId of allLessonIds) {
      const progress = this.getLessonProgress(lessonId);
      if (!progress || progress.isNotStarted()) {
        return lessonId;
      }
    }
    return undefined;
  }

  public getCurrentLesson(): LessonProgress | undefined {
    // Return the most recent in-progress lesson
    return this.props.lessonProgresses
      .filter(lp => lp.isInProgress())
      .sort((a, b) => b.lastAttemptAt?.getTime() || 0 - (a.lastAttemptAt?.getTime() || 0))[0];
  }

  public getLastCompletedLesson(): LessonProgress | undefined {
    // Return the most recently completed lesson
    return this.props.lessonProgresses
      .filter(lp => lp.isCompleted())
      .sort((a, b) => (b.completedAt?.getTime() || 0) - (a.completedAt?.getTime() || 0))[0];
  }

  public getAverageTimePerLesson(): number {
    const completedLessons = this.props.lessonProgresses.filter(lp => lp.isCompleted());
    if (completedLessons.length === 0) return 0;
    
    const totalTime = completedLessons.reduce((sum, lp) => sum + lp.timeSpent, 0);
    return totalTime / completedLessons.length;
  }

  public updateLastAccessedAt(date: Date = new Date()): void {
    this.props.lastAccessedAt = date;
  }

  private checkAndUpdateModuleCompletion(): void {
    // This would need to be called with total lessons count from the module
    // For now, we just update lastAccessedAt
    this.updateLastAccessedAt();
  }

  public completeModule(completedAt: Date = new Date()): Result<void> {
    if (this.props.completedAt) {
      return Result.fail(new Error('Module is already completed'));
    }

    this.props.completedAt = completedAt;
    this.updateLastAccessedAt(completedAt);
    return Result.ok();
  }

  public isCompleted(): boolean {
    return !!this.props.completedAt;
  }

  public getDaysActive(): number {
    const start = this.props.startedAt;
    const end = this.props.lastAccessedAt || new Date();
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  public getStreak(): number {
    // Simple implementation - could be enhanced with more sophisticated streak tracking
    const today = new Date();
    const lastAccess = this.props.lastAccessedAt;
    
    if (!lastAccess) return 0;
    
    const diffTime = today.getTime() - lastAccess.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    // If accessed today or yesterday, maintain streak
    return diffDays <= 1 ? this.getDaysActive() : 0;
  }
}