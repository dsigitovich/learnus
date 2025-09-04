import { DomainEvent } from '@shared/types/domain-event';

export interface IEventBus {
  publish(_event: DomainEvent): void;
  subscribe(_eventName: string, _handler: (_event: DomainEvent) => void): void;
}