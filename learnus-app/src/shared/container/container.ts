import 'reflect-metadata';
import { Container } from 'inversify';
import { TYPES } from './types';

// Domain
import { ICourseRepository } from '@domain/repositories/ICourseRepository';
import { IUserRepository } from '@domain/repositories/IUserRepository';

// Application
import { IAIService } from '@application/interfaces/IAIService';
import { IEventBus } from '@application/interfaces/IEventBus';
import { CreateCourseUseCase } from '@application/use-cases/CreateCourseUseCase';

// Infrastructure
import { DatabaseAdapterFactory } from '@infrastructure/database/adapters/DatabaseAdapter';
import { OpenAIService } from '@infrastructure/ai/OpenAIService';
import { EventBus } from '@infrastructure/events/EventBus';

const container = new Container();

// Initialize database adapter
const dbAdapter = DatabaseAdapterFactory.create();

// Bind repositories using adapter
container.bind<ICourseRepository>(TYPES.ICourseRepository).toDynamicValue(() => {
  return dbAdapter.getCourseRepository();
}).inSingletonScope();

container.bind<IUserRepository>(TYPES.IUserRepository).toDynamicValue(() => {
  return dbAdapter.getUserRepository();
}).inSingletonScope();

// Bind services
container.bind<IAIService>(TYPES.IAIService).to(OpenAIService).inSingletonScope();
container.bind<IEventBus>(TYPES.IEventBus).to(EventBus).inSingletonScope();

// Bind use cases
container.bind<CreateCourseUseCase>(TYPES.CreateCourseUseCase).to(CreateCourseUseCase);

// Initialize database
dbAdapter.initialize().catch(console.error);

export { container };