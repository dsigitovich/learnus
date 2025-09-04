import { Result } from '@shared/types/result';

export enum LessonProgressStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

interface LessonProgressProps {
  lessonId: string;
  status: LessonProgressStatus;
  startedAt: Date;
  completedAt?: Date;
  timeSpent?: number; // в секундах
  attempts?: number;
  lastAttemptAt?: Date;
}

export class LessonProgress {
  protected props: LessonProgressProps;
  get lessonId(): string {
    return this.props.lessonId;
  }

  get status(): LessonProgressStatus {
    return this.props.status;
  }

  get startedAt(): Date {
    return this.props.startedAt;
  }

  get completedAt(): Date | undefined {
    return this.props.completedAt;
  }

  get timeSpent(): number {
    return this.props.timeSpent || 0;
  }

  get attempts(): number {
    return this.props.attempts || 0;
  }

  get lastAttemptAt(): Date | undefined {
    return this.props.lastAttemptAt;
  }

  private constructor(props: LessonProgressProps) {
    this.props = props;
  }

  public static create(props: LessonProgressProps): Result<LessonProgress> {
    // Validate lesson ID
    if (!props.lessonId || props.lessonId.trim() === '') {
      return Result.fail(new Error('Lesson ID cannot be empty'));
    }

    // Validate completion date consistency
    if (props.completedAt && props.status !== LessonProgressStatus.COMPLETED) {
      return Result.fail(new Error('Completed date can only be set for completed lessons'));
    }

    // Validate time spent
    if (props.timeSpent !== undefined && props.timeSpent < 0) {
      return Result.fail(new Error('Time spent cannot be negative'));
    }

    // Validate attempts
    if (props.attempts !== undefined && props.attempts < 0) {
      return Result.fail(new Error('Attempts cannot be negative'));
    }

    const lessonProgress = new LessonProgress({
      lessonId: props.lessonId.trim(),
      status: props.status,
      startedAt: props.startedAt,
      completedAt: props.completedAt,
      timeSpent: props.timeSpent,
      attempts: props.attempts,
      lastAttemptAt: props.lastAttemptAt,
    });

    return Result.ok(lessonProgress);
  }

  public start(startedAt: Date): Result<void> {
    if (this.props.status !== LessonProgressStatus.NOT_STARTED) {
      return Result.fail(new Error('Lesson is already started or completed'));
    }

    this.props.status = LessonProgressStatus.IN_PROGRESS;
    this.props.startedAt = startedAt;
    this.props.lastAttemptAt = startedAt;
    this.props.attempts = (this.props.attempts || 0) + 1;

    return Result.ok();
  }

  public complete(completedAt: Date, timeSpent: number): Result<void> {
    if (this.props.status === LessonProgressStatus.COMPLETED) {
      return Result.fail(new Error('Lesson is already completed'));
    }

    if (timeSpent < 0) {
      return Result.fail(new Error('Time spent cannot be negative'));
    }

    this.props.status = LessonProgressStatus.COMPLETED;
    this.props.completedAt = completedAt;
    this.props.timeSpent = timeSpent;
    this.props.lastAttemptAt = completedAt;

    return Result.ok();
  }

  public updateTimeSpent(additionalTime: number): Result<void> {
    if (additionalTime < 0) {
      return Result.fail(new Error('Additional time cannot be negative'));
    }

    this.props.timeSpent = (this.props.timeSpent || 0) + additionalTime;
    return Result.ok();
  }

  public recordAttempt(attemptAt: Date): void {
    this.props.attempts = (this.props.attempts || 0) + 1;
    this.props.lastAttemptAt = attemptAt;
  }

  public isCompleted(): boolean {
    return this.props.status === LessonProgressStatus.COMPLETED;
  }

  public isInProgress(): boolean {
    return this.props.status === LessonProgressStatus.IN_PROGRESS;
  }

  public isNotStarted(): boolean {
    return this.props.status === LessonProgressStatus.NOT_STARTED;
  }

  public getFormattedTimeSpent(): string {
    const totalSeconds = this.timeSpent;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    if (hours > 0) {
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
    return `${minutes}m`;
  }

  public getDurationInMinutes(): number {
    return Math.round(this.timeSpent / 60);
  }
}