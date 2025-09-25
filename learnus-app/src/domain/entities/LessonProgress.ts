import { Entity } from '@shared/types/entity';
import { Result } from '@shared/types/result';
import { ProgressStatus } from '../value-objects/ProgressStatus';

interface LessonProgressProps {
  lessonId: string;
  userId: string;
  status: ProgressStatus;
  startedAt?: Date;
  completedAt?: Date;
  notes?: string;
}

export class LessonProgress extends Entity<LessonProgressProps> {
  get lessonId(): string {
    return this.props.lessonId;
  }

  get userId(): string {
    return this.props.userId;
  }

  get status(): ProgressStatus {
    return this.props.status;
  }

  get startedAt(): Date | undefined {
    return this.props.startedAt;
  }

  get completedAt(): Date | undefined {
    return this.props.completedAt;
  }

  get notes(): string | undefined {
    return this.props.notes;
  }

  private constructor(props: LessonProgressProps, id?: string) {
    super(props, id);
  }

  public static create(
    lessonId: string,
    userId: string,
    status: ProgressStatus = ProgressStatus.notStarted(),
    id?: string
  ): Result<LessonProgress> {
    if (!lessonId || lessonId.trim() === '') {
      return Result.fail(new Error('Lesson ID cannot be empty'));
    }

    if (!userId || userId.trim() === '') {
      return Result.fail(new Error('User ID cannot be empty'));
    }

    const lessonProgress = new LessonProgress(
      {
        lessonId: lessonId.trim(),
        userId: userId.trim(),
        status,
      },
      id
    );

    return Result.ok(lessonProgress);
  }

  public start(): Result<void> {
    if (!this.status.canStart()) {
      return Result.fail(new Error('Cannot start lesson that is not in not_started state'));
    }

    const startResult = this.status.start();
    if (startResult.isFailure) {
      return Result.fail(startResult.getError());
    }

    this.props.status = startResult.getValue();
    this.props.startedAt = new Date();
    return Result.ok();
  }

  public complete(): Result<void> {
    if (!this.status.canComplete()) {
      return Result.fail(new Error('Cannot complete lesson that is not in progress'));
    }

    const completeResult = this.status.complete();
    if (completeResult.isFailure) {
      return Result.fail(completeResult.getError());
    }

    this.props.status = completeResult.getValue();
    this.props.completedAt = new Date();
    return Result.ok();
  }

  public restart(): Result<void> {
    if (!this.status.canRestart()) {
      return Result.fail(new Error('Cannot restart lesson that is not completed'));
    }

    const restartResult = this.status.restart();
    if (restartResult.isFailure) {
      return Result.fail(restartResult.getError());
    }

    this.props.status = restartResult.getValue();
    this.props.startedAt = undefined;
    this.props.completedAt = undefined;
    return Result.ok();
  }

  public addNotes(notes: string): Result<void> {
    if (!notes || notes.trim() === '') {
      return Result.fail(new Error('Notes cannot be empty'));
    }

    this.props.notes = notes.trim();
    return Result.ok();
  }

  public updateNotes(notes: string): Result<void> {
    if (!notes || notes.trim() === '') {
      return Result.fail(new Error('Notes cannot be empty'));
    }

    this.props.notes = notes.trim();
    return Result.ok();
  }

  public getDuration(): number | undefined {
    if (!this.startedAt) {
      return undefined;
    }

    const endTime = this.completedAt || new Date();
    return endTime.getTime() - this.startedAt.getTime();
  }

  public getDurationInMinutes(): number | undefined {
    const duration = this.getDuration();
    return duration ? Math.round(duration / (1000 * 60)) : undefined;
  }

  public isCompleted(): boolean {
    return this.status.isCompleted();
  }

  public isInProgress(): boolean {
    return this.status.isInProgress();
  }

  public isNotStarted(): boolean {
    return this.status.isNotStarted();
  }
}