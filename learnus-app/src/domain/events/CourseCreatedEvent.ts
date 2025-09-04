import { DomainEvent } from '@shared/types/domain-event';

export class CourseCreatedEvent implements DomainEvent {
  public readonly occurredAt: Date;
  public readonly aggregateId: string;

  constructor(
    public readonly courseId: string,
    public readonly _title: string,
    public readonly _level: string,
    public readonly _userId?: string
  ) {
    this.occurredAt = new Date();
    this.aggregateId = courseId;
  }
}