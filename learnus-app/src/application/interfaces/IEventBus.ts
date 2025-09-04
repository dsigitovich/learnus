import { DomainEvent } from '@shared/types/domain-event';

export interface IEventBus {
  publish(event: DomainEvent): Promise<void>;
  subscribe(eventName: string, handler: (event: DomainEvent) => Promise<void>): void;
}