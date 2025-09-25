import { Entity } from '@shared/types/entity';
import { Result } from '@shared/types/result';
import { LessonProgress } from './LessonProgress';
import { ProgressStatus } from '../value-objects/ProgressStatus';

interface CourseProgressProps {
  courseId: string;
  userId: string;
  lessonProgresses: LessonProgress[];
  startedAt?: Date;
  completedAt?: Date;
}

export class CourseProgress extends Entity<CourseProgressProps> {
  get courseId(): string {
    return this.props.courseId;
  }

  get userId(): string {
    return this.props.userId;
  }

  get lessonProgresses(): LessonProgress[] {
    return this.props.lessonProgresses;
  }

  get startedAt(): Date | undefined {
    return this.props.startedAt;
  }

  get completedAt(): Date | undefined {
    return this.props.completedAt;
  }

  private constructor(props: CourseProgressProps, id?: string) {
    super(props, id);
  }

  public static create(
    courseId: string,
    userId: string,
    lessonProgresses: LessonProgress[] = [],
    id?: string
  ): Result<CourseProgress> {
    if (!courseId || courseId.trim() === '') {
      return Result.fail(new Error('Course ID cannot be empty'));
    }

    if (!userId || userId.trim() === '') {
      return Result.fail(new Error('User ID cannot be empty'));
    }

    const courseProgress = new CourseProgress(
      {
        courseId: courseId.trim(),
        userId: userId.trim(),
        lessonProgresses,
      },
      id
    );

    return Result.ok(courseProgress);
  }

  public addLessonProgress(lessonProgress: LessonProgress): Result<void> {
    if (lessonProgress.userId !== this.userId) {
      return Result.fail(new Error('Lesson progress user ID does not match course progress user ID'));
    }

    const existingIndex = this.props.lessonProgresses.findIndex(
      lp => lp.lessonId === lessonProgress.lessonId
    );

    if (existingIndex !== -1) {
      return Result.fail(new Error('Lesson progress already exists for this lesson'));
    }

    this.props.lessonProgresses.push(lessonProgress);
    return Result.ok();
  }

  public updateLessonProgress(lessonId: string, status: ProgressStatus): Result<void> {
    const lessonProgress = this.getLessonProgress(lessonId);
    if (!lessonProgress) {
      return Result.fail(new Error('Lesson progress not found'));
    }

    if (status.isNotStarted()) {
      return lessonProgress.restart();
    } else if (status.isInProgress()) {
      return lessonProgress.start();
    } else if (status.isCompleted()) {
      return lessonProgress.complete();
    }

    return Result.fail(new Error('Invalid status transition'));
  }

  public getLessonProgress(lessonId: string): LessonProgress | undefined {
    return this.props.lessonProgresses.find(lp => lp.lessonId === lessonId);
  }

  public getTotalLessons(): number {
    return this.props.lessonProgresses.length;
  }

  public getCompletedLessons(): number {
    return this.props.lessonProgresses.filter(lp => lp.isCompleted()).length;
  }

  public getInProgressLessons(): number {
    return this.props.lessonProgresses.filter(lp => lp.isInProgress()).length;
  }

  public getNotStartedLessons(): number {
    return this.props.lessonProgresses.filter(lp => lp.isNotStarted()).length;
  }

  public getCompletionPercentage(): number {
    const total = this.getTotalLessons();
    if (total === 0) return 0;
    return Math.round((this.getCompletedLessons() / total) * 100);
  }

  public getOverallStatus(): ProgressStatus {
    const total = this.getTotalLessons();
    const completed = this.getCompletedLessons();
    const inProgress = this.getInProgressLessons();

    if (total === 0) {
      return ProgressStatus.notStarted();
    }

    if (completed === total) {
      return ProgressStatus.completed();
    }

    if (completed > 0 || inProgress > 0) {
      return ProgressStatus.inProgress();
    }

    return ProgressStatus.notStarted();
  }

  public start(): Result<void> {
    if (this.getTotalLessons() === 0) {
      return Result.fail(new Error('Cannot start course with no lessons'));
    }

    this.props.startedAt = new Date();
    return Result.ok();
  }

  public complete(): Result<void> {
    if (this.getCompletionPercentage() < 100) {
      return Result.fail(new Error('Cannot complete course that is not 100% finished'));
    }

    this.props.completedAt = new Date();
    return Result.ok();
  }

  public getTotalDuration(): number {
    return this.props.lessonProgresses.reduce((total, lp) => {
      const duration = lp.getDuration();
      return total + (duration || 0);
    }, 0);
  }

  public getTotalDurationInMinutes(): number {
    return Math.round(this.getTotalDuration() / (1000 * 60));
  }

  public getAverageLessonDuration(): number {
    const completedLessons = this.props.lessonProgresses.filter(lp => lp.isCompleted());
    if (completedLessons.length === 0) return 0;

    const totalDuration = completedLessons.reduce((total, lp) => {
      const duration = lp.getDuration();
      return total + (duration || 0);
    }, 0);

    return Math.round(totalDuration / completedLessons.length);
  }

  public getAverageLessonDurationInMinutes(): number {
    return Math.round(this.getAverageLessonDuration() / (1000 * 60));
  }

  public isCompleted(): boolean {
    return this.getOverallStatus().isCompleted();
  }

  public isInProgress(): boolean {
    return this.getOverallStatus().isInProgress();
  }

  public isNotStarted(): boolean {
    return this.getOverallStatus().isNotStarted();
  }
}