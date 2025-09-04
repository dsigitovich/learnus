import { injectable } from 'inversify';
import { IEventBus } from '@application/interfaces/IEventBus';
import { DomainEvent } from '@shared/types/domain-event';

type EventHandler = (event: DomainEvent) => Promise<void>;

@injectable()
export class EventBus implements IEventBus {
  private handlers: Map<string, EventHandler[]> = new Map();

  async publish(event: DomainEvent): Promise<void> {
    const eventName = event.constructor.name;
    const handlers = this.handlers.get(eventName) || [];
    
    // Execute all handlers for this event
    await Promise.all(
      handlers.map(handler => handler(event))
    );
  }

  subscribe(eventName: string, handler: EventHandler): void {
    const handlers = this.handlers.get(eventName) || [];
    handlers.push(handler);
    this.handlers.set(eventName, handlers);
  }
}