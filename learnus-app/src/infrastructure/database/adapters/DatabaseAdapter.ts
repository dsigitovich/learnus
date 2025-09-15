import { ICourseRepository } from '../../../domain/repositories/ICourseRepository';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';

export interface DatabaseAdapter {
  getCourseRepository(): ICourseRepository;
  getUserRepository(): IUserRepository;
  initialize(): Promise<void>;
  close(): Promise<void>;
}

// Фабрика для создания адаптера в зависимости от окружения
export class DatabaseAdapterFactory {
  static create(): DatabaseAdapter {
    const isVercel = process.env.VERCEL === '1';
    const isProduction = process.env.NODE_ENV === 'production';
    
    if (isVercel || isProduction) {
      // Для Vercel используем внешнюю базу данных
      return new ExternalDatabaseAdapter();
    } else {
      // Для локальной разработки используем SQLite
      return new SQLiteDatabaseAdapter();
    }
  }
}

// SQLite адаптер для локальной разработки
class SQLiteDatabaseAdapter implements DatabaseAdapter {
  private courseRepository?: ICourseRepository;
  private userRepository?: IUserRepository;

  async initialize(): Promise<void> {
    const { CourseRepository } = await import('./SQLiteCourseRepository');
    const { UserRepository } = await import('./SQLiteUserRepository');
    
    this.courseRepository = new CourseRepository();
    this.userRepository = new UserRepository();
  }

  getCourseRepository(): ICourseRepository {
    if (!this.courseRepository) {
      throw new Error('Database not initialized');
    }
    return this.courseRepository;
  }

  getUserRepository(): IUserRepository {
    if (!this.userRepository) {
      throw new Error('Database not initialized');
    }
    return this.userRepository;
  }

  async close(): Promise<void> {
    // SQLite закрывается автоматически
  }
}

// Внешний адаптер для продакшена (PostgreSQL, MySQL, etc.)
class ExternalDatabaseAdapter implements DatabaseAdapter {
  private courseRepository?: ICourseRepository;
  private userRepository?: IUserRepository;

  async initialize(): Promise<void> {
    // Здесь можно подключить PostgreSQL, MySQL, или другую внешнюю БД
    // Пока используем мок-репозитории
    const { MockCourseRepository } = await import('./MockCourseRepository');
    const { MockUserRepository } = await import('./MockUserRepository');
    
    this.courseRepository = new MockCourseRepository();
    this.userRepository = new MockUserRepository();
  }

  getCourseRepository(): ICourseRepository {
    if (!this.courseRepository) {
      throw new Error('Database not initialized');
    }
    return this.courseRepository;
  }

  getUserRepository(): IUserRepository {
    if (!this.userRepository) {
      throw new Error('Database not initialized');
    }
    return this.userRepository;
  }

  async close(): Promise<void> {
    // Закрытие соединения с внешней БД
  }
}

