import 'reflect-metadata';
import { Container } from 'inversify';
import { TYPES } from './types';

// Domain
import { ICourseRepository } from '@domain/repositories/ICourseRepository';
import { ICourseProgressRepository } from '@domain/repositories/ICourseProgressRepository';
import { IUserRepository } from '@domain/repositories/IUserRepository';

// Application
import { IAIService } from '@application/interfaces/IAIService';
import { IEventBus } from '@application/interfaces/IEventBus';
import { CreateCourseUseCase } from '@application/use-cases/CreateCourseUseCase';
import { GetCourseProgressUseCase } from '@application/use-cases/GetCourseProgressUseCase';
import { UpdateLessonProgressUseCase } from '@application/use-cases/UpdateLessonProgressUseCase';

// Infrastructure
import { CourseRepository } from '@infrastructure/database/CourseRepository';
import { UserRepository } from '@infrastructure/database/UserRepository';
import { CourseProgressRepository } from '@infrastructure/database/CourseProgressRepository';
import { DatabaseService } from '@infrastructure/database/Database';
import { OpenAIService } from '@infrastructure/ai/OpenAIService';
import { EventBus } from '@infrastructure/events/EventBus';

const container = new Container();

// Bind database service
container.bind<DatabaseService>(TYPES.Database).to(DatabaseService).inSingletonScope();

// Bind repositories
container.bind<ICourseRepository>(TYPES.ICourseRepository).to(CourseRepository).inSingletonScope();
container.bind<IUserRepository>(TYPES.IUserRepository).to(UserRepository).inSingletonScope();
container.bind<ICourseProgressRepository>(TYPES.ICourseProgressRepository).to(CourseProgressRepository).inSingletonScope();

// Bind services
container.bind<IAIService>(TYPES.IAIService).to(OpenAIService).inSingletonScope();
container.bind<IEventBus>(TYPES.IEventBus).to(EventBus).inSingletonScope();

// Bind use cases
container.bind<CreateCourseUseCase>(TYPES.CreateCourseUseCase).to(CreateCourseUseCase);
container.bind<GetCourseProgressUseCase>(TYPES.GetCourseProgressUseCase).to(GetCourseProgressUseCase);
container.bind<UpdateLessonProgressUseCase>(TYPES.UpdateLessonProgressUseCase).to(UpdateLessonProgressUseCase);

export { container };