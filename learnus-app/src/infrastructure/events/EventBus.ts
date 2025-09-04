import { injectable } from 'inversify';
import { IEventBus } from '@application/interfaces/IEventBus';
import { DomainEvent } from '@shared/types/domain-event';

type EventHandler = (_event: DomainEvent) => void;

@injectable()
export class EventBus implements IEventBus {
  private handlers: Map<string, EventHandler[]> = new Map();

  publish(_event: DomainEvent): void {
    const eventName = _event.constructor.name;
    const handlers = this.handlers.get(eventName) || [];
    
    // Execute all handlers for this event
    handlers.forEach(handler => handler(_event));
  }

  subscribe(eventName: string, handler: EventHandler): void {
    const handlers = this.handlers.get(eventName) || [];
    handlers.push(handler);
    this.handlers.set(eventName, handlers);
  }
}