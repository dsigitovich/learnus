# 🚀 Руководство по разработке LearnUs

## Быстрый старт

### Установка зависимостей
```bash
npm install
```

### Запуск в режиме разработки
```bash
# Обычный режим
npm run dev

# Безопасный режим (с проверками)
npm run dev:safe
```

## 🔧 Полезные команды

### Проверки
```bash
# Быстрая проверка (без тестов)
npm run check-quick

# Полная проверка
npm run check-all

# Только TypeScript
npm run type-check

# Только линтер
npm run lint

# Исправить линтер
npm run lint:fix
```

### Тестирование
```bash
# Запуск тестов
npm test

# Тесты в watch режиме
npm run test:watch

# Покрытие тестами
npm run test:coverage
```

### Создание новых файлов
```bash
# Создать Value Object
npm run create:value-object MyValueObject

# Создать Entity
npm run create:entity MyEntity

# Создать Use Case
npm run create:use-case MyUseCase
```

## 📁 Структура проекта

```
src/
├── domain/                    # 🎯 Ядро бизнес-логики
│   ├── entities/             # User, Course, Lesson, Module
│   ├── value-objects/        # Email, CourseLevel, Progress
│   ├── aggregates/           # CourseAggregate, UserAggregate
│   ├── repositories/         # Интерфейсы репозиториев
│   ├── services/            # Domain services
│   └── events/               # Domain events
│
├── application/               # 🚀 Use Cases & Application Services
│   ├── use-cases/            # CreateCourse, StartLesson, CompleteModule
│   ├── services/              # CourseService, UserService, AIService
│   ├── dto/                   # Data Transfer Objects
│   └── interfaces/            # Application interfaces
│
├── infrastructure/            # 🔌 Внешние зависимости
│   ├── database/              # SQLite implementation
│   ├── ai/                    # OpenAI, Claude, etc.
│   ├── auth/                  # NextAuth implementation
│   └── external/              # Другие внешние сервисы
│
├── presentation/              # 🎨 UI & API
│   ├── components/            # React components
│   ├── pages/                 # Next.js pages
│   ├── api/                   # API routes
│   └── hooks/                 # Custom hooks
│
└── shared/                   # 🔧 Общие утилиты
    ├── types/                 # TypeScript types
    ├── utils/                 # Helper functions
    └── constants/             # App constants
```

## 🎯 Принципы разработки

### 1. TDD (Test-Driven Development)
- Всегда пишите тесты ПЕРЕД кодом
- Следуйте циклу Red-Green-Refactor
- Покрытие тестами должно быть > 80%

### 2. DDD (Domain-Driven Design)
- Domain Layer НЕ зависит от других слоев
- Application Layer зависит только от Domain
- Infrastructure Layer зависит от Domain и Application
- Presentation Layer зависит от Application и Domain

### 3. Hexagonal Architecture
- Четкое разделение на слои
- Зависимости направлены к центру (Domain)
- Использование интерфейсов для абстракции

## 🔍 Процесс разработки

### 1. Перед началом работы
```bash
# Убедиться, что проект в чистом состоянии
npm run check-all

# Создать новую ветку
git checkout -b feature/my-feature
```

### 2. При создании новых файлов
```bash
# Использовать шаблоны
npm run create:value-object MyValueObject
npm run create:entity MyEntity
npm run create:use-case MyUseCase
```

### 3. Промежуточные проверки
После каждого значимого изменения:
```bash
npm run check-quick
```

### 4. Перед коммитом
```bash
npm run check-all
```

## 🚨 Частые ошибки и их решения

### ❌ Неправильные импорты
```typescript
// Плохо
import { ValueObject } from '@/shared/types/value-object';

// Хорошо
import { ValueObject } from '@shared/types/value-object';
```

### ❌ Неправильное использование Result
```typescript
// Плохо
if (result.isFailure()) { ... }
return Result.fail<User>(error);

// Хорошо
if (result.isFailure) { ... }
return Result.fail(error);
```

### ❌ Отсутствие методов в Value Objects
```typescript
// Всегда добавляйте
public get value(): T { return this.props; }
public equals(other: MyValueObject): boolean { return this.props === other.props; }
```

### ❌ Неправильное использование Container
```typescript
// Плохо
container.resolve<IService>('IService')

// Хорошо
container.get<IService>('IService')
```

## 📚 Полезные ресурсы

- [Чек-лист разработки](./DEVELOPMENT_CHECKLIST.md)
- [Архитектура проекта](./docs/ARCHITECTURE.md)
- [Настройка Google OAuth](./docs/GOOGLE_OAUTH_SETUP.md)

## 🎯 Цели качества

- ✅ Покрытие тестами: > 80%
- ✅ TypeScript strict mode: включен
- ✅ ESLint errors: 0
- ✅ Build time: < 30 секунд
- ✅ Архитектурная чистота: 100%
