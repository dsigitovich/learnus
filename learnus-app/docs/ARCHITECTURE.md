# Архитектура LearnUs

## Обзор

Проект LearnUs построен на основе Hexagonal Architecture (Ports & Adapters) в сочетании с принципами Domain-Driven Design (DDD).

## Структура проекта

```
src/
├── domain/                    # Бизнес-логика (ядро)
│   ├── entities/             # Сущности (User, Course, Lesson, Module)
│   ├── value-objects/        # Объекты-значения (Email, CourseLevel, CourseTitle)
│   ├── aggregates/           # Агрегаты (CourseAggregate)
│   ├── repositories/         # Интерфейсы репозиториев
│   ├── services/             # Доменные сервисы
│   └── events/               # Доменные события
│
├── application/              # Слой приложения
│   ├── use-cases/           # Сценарии использования (CreateCourse)
│   ├── services/            # Сервисы приложения
│   ├── dto/                 # Data Transfer Objects
│   └── interfaces/          # Интерфейсы для внешних сервисов
│
├── infrastructure/          # Инфраструктура
│   ├── database/           # Реализация репозиториев
│   ├── ai/                 # Интеграция с AI (OpenAI)
│   ├── auth/               # Аутентификация
│   └── events/             # Event Bus
│
├── presentation/           # Презентационный слой
│   ├── components/        # React компоненты
│   ├── pages/             # Next.js страницы
│   ├── api/               # API routes
│   └── hooks/             # React hooks
│
└── shared/                # Общие утилиты
    ├── types/             # Базовые типы (Entity, ValueObject, Result)
    ├── utils/             # Вспомогательные функции
    └── container/         # DI контейнер
```

## Ключевые принципы

### 1. Независимость слоев
- Domain слой не зависит от других слоев
- Application слой зависит только от Domain
- Infrastructure зависит от Domain и Application
- Presentation зависит от Application

### 2. Dependency Injection
Используется Inversify для управления зависимостями:

```typescript
// Регистрация зависимостей
container.bind<ICourseRepository>(TYPES.ICourseRepository).to(CourseRepository);
container.bind<IAIService>(TYPES.IAIService).to(OpenAIService);

// Использование в use case
@injectable()
export class CreateCourseUseCase {
  constructor(
    @inject(TYPES.ICourseRepository) private courseRepository: ICourseRepository,
    @inject(TYPES.IAIService) private aiService: IAIService
  ) {}
}
```

### 3. Result Pattern
Для обработки ошибок используется Result pattern:

```typescript
public static create(props: CreateProps): Result<Course> {
  if (!props.title) {
    return Result.fail(new Error('Title is required'));
  }
  return Result.ok(new Course(props));
}
```

### 4. Value Objects
Инкапсулируют бизнес-правила для значений:

```typescript
export class CourseLevel extends ValueObject<{ value: string }> {
  public canAccess(userLevel: CourseLevel): boolean {
    // Бизнес-логика проверки доступа
  }
}
```

### 5. Aggregates
Группируют связанные сущности:

```typescript
export class CourseAggregate extends AggregateRoot<Props> {
  public addModule(module: Module): void {
    this.props.modules.push(module);
    this.addDomainEvent(new ModuleAddedEvent(this.id, module.id));
  }
}
```

## API Endpoints

### Курсы
- `POST /api/courses` - Создание курса
- `GET /api/courses` - Получение всех курсов
- `GET /api/courses/[id]` - Получение курса по ID
- `DELETE /api/courses/[id]` - Удаление курса

### Чат
- `POST /api/chat` - Отправка сообщения в чат

## Тестирование

Проект следует принципам TDD:

1. Сначала пишутся тесты
2. Затем минимальная реализация
3. Рефакторинг при сохранении зеленых тестов

```bash
npm test           # Запуск всех тестов
npm test:watch     # Запуск в режиме наблюдения
npm test:coverage  # Проверка покрытия
```

## Добавление новой функциональности

1. Начните с Domain слоя (entities, value objects)
2. Напишите тесты для use case
3. Реализуйте use case
4. Создайте infrastructure адаптеры
5. Добавьте API endpoints
6. Обновите UI компоненты

## Конфигурация

Переменные окружения:
- `OPENAI_API_KEY` - Ключ API для OpenAI