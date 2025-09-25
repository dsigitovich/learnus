export const TYPES = {
  // Repositories
  ICourseRepository: Symbol.for('ICourseRepository'),
  IUserRepository: Symbol.for('IUserRepository'),
  ICourseProgressRepository: Symbol.for('ICourseProgressRepository'),
  
  // Services
  IAIService: Symbol.for('IAIService'),
  IEventBus: Symbol.for('IEventBus'),
  
  // Use Cases
  CreateCourseUseCase: Symbol.for('CreateCourseUseCase'),
  GetCourseProgressUseCase: Symbol.for('GetCourseProgressUseCase'),
  UpdateLessonProgressUseCase: Symbol.for('UpdateLessonProgressUseCase'),
  
  // Infrastructure
  Database: Symbol.for('Database'),
  OpenAI: Symbol.for('OpenAI'),
};