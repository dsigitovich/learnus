import { ValueObject } from '@shared/types/value-object';
import { Result } from '@shared/types/result';

export type ProgressStatusValue = 'not_started' | 'in_progress' | 'completed';

interface ProgressStatusProps {
  value: ProgressStatusValue;
}

export class ProgressStatus extends ValueObject<ProgressStatusProps> {
  get value(): ProgressStatusValue {
    return this.props.value;
  }

  private constructor(props: ProgressStatusProps) {
    super(props);
  }

  public static create(value: ProgressStatusValue): Result<ProgressStatus> {
    if (!['not_started', 'in_progress', 'completed'].includes(value)) {
      return Result.fail(new Error('Invalid progress status'));
    }

    return Result.ok(new ProgressStatus({ value }));
  }

  public static notStarted(): ProgressStatus {
    return new ProgressStatus({ value: 'not_started' });
  }

  public static inProgress(): ProgressStatus {
    return new ProgressStatus({ value: 'in_progress' });
  }

  public static completed(): ProgressStatus {
    return new ProgressStatus({ value: 'completed' });
  }

  public isNotStarted(): boolean {
    return this.value === 'not_started';
  }

  public isInProgress(): boolean {
    return this.value === 'in_progress';
  }

  public isCompleted(): boolean {
    return this.value === 'completed';
  }

  public canStart(): boolean {
    return this.isNotStarted();
  }

  public canComplete(): boolean {
    return this.isInProgress();
  }

  public canRestart(): boolean {
    return this.isCompleted();
  }

  public start(): Result<ProgressStatus> {
    if (!this.canStart()) {
      return Result.fail(new Error('Cannot start progress that is not in not_started state'));
    }
    return Result.ok(ProgressStatus.inProgress());
  }

  public complete(): Result<ProgressStatus> {
    if (!this.canComplete()) {
      return Result.fail(new Error('Cannot complete progress that is not in progress'));
    }
    return Result.ok(ProgressStatus.completed());
  }

  public restart(): Result<ProgressStatus> {
    if (!this.canRestart()) {
      return Result.fail(new Error('Cannot restart progress that is not completed'));
    }
    return Result.ok(ProgressStatus.notStarted());
  }

  public toString(): string {
    switch (this.value) {
      case 'not_started':
        return 'Не начато';
      case 'in_progress':
        return 'В процессе';
      case 'completed':
        return 'Завершено';
      default:
        return 'Неизвестно';
    }
  }
}