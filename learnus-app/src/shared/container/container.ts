import 'reflect-metadata';
import { Container } from 'inversify';
import { TYPES } from './types';

// Domain
import { ICourseRepository } from '@domain/repositories/ICourseRepository';

// Application
import { IAIService } from '@application/interfaces/IAIService';
import { IEventBus } from '@application/interfaces/IEventBus';
import { CreateCourseUseCase } from '@application/use-cases/CreateCourseUseCase';

// Infrastructure
import { CourseRepository } from '@infrastructure/database/CourseRepository';
import { OpenAIService } from '@infrastructure/ai/OpenAIService';
import { EventBus } from '@infrastructure/events/EventBus';

const container = new Container();

// Bind repositories
container.bind<ICourseRepository>(TYPES.ICourseRepository).to(CourseRepository).inSingletonScope();

// Bind services
container.bind<IAIService>(TYPES.IAIService).to(OpenAIService).inSingletonScope();
container.bind<IEventBus>(TYPES.IEventBus).to(EventBus).inSingletonScope();

// Bind use cases
container.bind<CreateCourseUseCase>(TYPES.CreateCourseUseCase).to(CreateCourseUseCase);

export { container };