export const TYPES = {
  // Repositories
  ICourseRepository: Symbol.for('ICourseRepository'),
  IUserRepository: Symbol.for('IUserRepository'),
  
  // Services
  IAIService: Symbol.for('IAIService'),
  IEventBus: Symbol.for('IEventBus'),
  
  // Use Cases
  CreateCourseUseCase: Symbol.for('CreateCourseUseCase'),
  
  // Infrastructure
  Database: Symbol.for('Database'),
  OpenAI: Symbol.for('OpenAI'),
};