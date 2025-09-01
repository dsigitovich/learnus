# Архитектура проекта Learnus

## Обзор архитектуры

Проект использует **слоистую архитектуру (Layered Architecture)** с четким разделением ответственности между слоями.

```
┌─────────────────────────────────────┐
│           Presentation Layer        │
│  (React Components + Pages)         │
├─────────────────────────────────────┤
│           Business Logic Layer      │
│  (Services + Hooks + Store)         │
├─────────────────────────────────────┤
│           Data Access Layer         │
│  (API Routes + Database)            │
├─────────────────────────────────────┤
│           Infrastructure Layer      │
│  (Database + External APIs)         │
└─────────────────────────────────────┘
```

## Структура папок

```
learnus-app/
├── app/                          # Next.js App Router
│   ├── api/                      # API endpoints
│   │   ├── programs/             # Программы обучения
│   │   ├── nodes/                # Узлы программ
│   │   ├── chat/                 # AI чат
│   │   └── progress/             # Прогресс обучения
│   ├── (routes)/                 # Группировка маршрутов
│   │   ├── programs/             # Страницы программ
│   │   └── dashboard/            # Дашборд
│   └── globals.css
├── components/                   # React компоненты
│   ├── ui/                       # Базовые UI компоненты
│   ├── features/                 # Функциональные компоненты
│   │   ├── chat/
│   │   ├── program-tree/
│   │   └── progress/
│   └── layout/                   # Компоненты макета
├── lib/                          # Библиотеки и утилиты
│   ├── services/                 # Бизнес-логика
│   │   ├── program-service.ts
│   │   ├── chat-service.ts
│   │   └── progress-service.ts
│   ├── hooks/                    # Кастомные хуки
│   ├── utils/                    # Утилиты
│   ├── db/                       # Работа с БД
│   └── types/                    # TypeScript типы
├── store/                        # Управление состоянием
│   ├── slices/                   # Слайсы Zustand
│   └── index.ts
└── public/                       # Статические файлы
```

## Правила разработки

### 1. Слои архитектуры

#### Presentation Layer (Слой представления)
- **Компоненты**: Только UI логика, без бизнес-логики
- **Страницы**: Организация маршрутов и layout
- **Хуки**: Использование кастомных хуков для получения данных

#### Business Logic Layer (Слой бизнес-логики)
- **Сервисы**: Инкапсуляция бизнес-логики
- **Хуки**: Кастомные хуки для управления состоянием
- **Store**: Централизованное управление состоянием

#### Data Access Layer (Слой доступа к данным)
- **API Routes**: RESTful endpoints
- **Валидация**: Zod схемы для входных данных
- **Обработка ошибок**: Единообразная обработка ошибок

#### Infrastructure Layer (Инфраструктурный слой)
- **База данных**: SQLite (dev) / PostgreSQL (prod)
- **Внешние API**: OpenAI, другие сервисы
- **Кэширование**: Redis для производительности

### 2. Правила именования

#### Файлы и папки
- **Компоненты**: PascalCase (например, `ProgramTree.tsx`)
- **Хуки**: camelCase с префиксом `use` (например, `usePrograms.ts`)
- **Сервисы**: camelCase с суффиксом `-service` (например, `program-service.ts`)
- **API routes**: kebab-case (например, `learning-progress.ts`)

#### Переменные и функции
- **Константы**: UPPER_SNAKE_CASE
- **Функции**: camelCase
- **Типы/Интерфейсы**: PascalCase
- **Приватные методы**: camelCase с префиксом `_`

### 3. Правила компонентов

#### Структура компонента
```typescript
// 1. Импорты
import { useState, useEffect } from 'react';
import { useStore } from '@/store';

// 2. Типы
interface ComponentProps {
  // props
}

// 3. Компонент
export default function ComponentName({ prop1, prop2 }: ComponentProps) {
  // 4. Состояние
  const [state, setState] = useState();
  
  // 5. Эффекты
  useEffect(() => {
    // side effects
  }, []);
  
  // 6. Обработчики
  const handleClick = () => {
    // logic
  };
  
  // 7. Рендер
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

#### Правила компонентов
- Один компонент = один файл
- Максимум 200 строк на компонент
- Используйте TypeScript для всех компонентов
- Разделяйте логику и представление

### 4. Правила API

#### Структура API endpoint
```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Валидация входных данных
    const validatedData = schema.parse(params);
    
    // 2. Бизнес-логика через сервис
    const result = await service.method(validatedData);
    
    // 3. Возврат результата
    return NextResponse.json(result);
  } catch (error) {
    // 4. Обработка ошибок
    return handleApiError(error);
  }
}
```

#### Правила API
- Всегда используйте try-catch
- Валидируйте входные данные
- Возвращайте единообразные ответы
- Логируйте ошибки

### 5. Правила базы данных

#### Структура запросов
```typescript
// 1. Открытие соединения
const db = await openDb();

try {
  // 2. Выполнение запроса
  const result = await db.get(query, params);
  
  // 3. Возврат результата
  return result;
} finally {
  // 4. Закрытие соединения
  await db.close();
}
```

#### Правила БД
- Всегда закрывайте соединения
- Используйте параметризованные запросы
- Создавайте индексы для часто используемых полей
- Используйте транзакции для сложных операций

### 6. Правила состояния

#### Zustand Store
```typescript
interface StoreState {
  // Состояние
  data: DataType[];
  
  // Actions
  setData: (data: DataType[]) => void;
  addData: (item: DataType) => void;
  updateData: (id: string, updates: Partial<DataType>) => void;
  removeData: (id: string) => void;
}

export const useStore = create<StoreState>((set, get) => ({
  // Начальное состояние
  data: [],
  
  // Actions
  setData: (data) => set({ data }),
  addData: (item) => set((state) => ({ 
    data: [...state.data, item] 
  })),
  // ...
}));
```

#### Правила состояния
- Разделяйте store на логические слайсы
- Используйте immer для сложных обновлений
- Избегайте глубокой вложенности состояния
- Оптимизируйте ре-рендеры с помощью селекторов

### 7. Правила производительности

#### Оптимизация React
- Используйте `React.memo` для тяжелых компонентов
- Используйте `useMemo` и `useCallback` для дорогих вычислений
- Виртуализируйте большие списки
- Lazy load компоненты

#### Оптимизация API
- Кэшируйте часто запрашиваемые данные
- Используйте пагинацию для больших списков
- Оптимизируйте запросы к БД
- Используйте CDN для статических ресурсов

### 8. Правила безопасности

#### Аутентификация и авторизация
- Реализуйте JWT токены
- Проверяйте права доступа на уровне API
- Храните секреты в environment variables
- Валидируйте все входные данные

#### Защита данных
- Используйте HTTPS в продакшене
- Хешируйте пароли
- Логируйте подозрительную активность
- Регулярно обновляйте зависимости

### 9. Правила тестирования

#### Unit тесты
- Тестируйте сервисы и утилиты
- Используйте моки для внешних зависимостей
- Покрытие кода минимум 80%

#### Integration тесты
- Тестируйте API endpoints
- Тестируйте взаимодействие с БД
- Используйте тестовую БД

#### E2E тесты
- Тестируйте критичные пользовательские сценарии
- Используйте Playwright или Cypress
- Автоматизируйте тесты в CI/CD

### 10. Правила деплоя

#### Environment
- Разные переменные для dev/staging/prod
- Используйте .env.local для локальной разработки
- Не коммитьте секреты в репозиторий

#### CI/CD
- Автоматические тесты при каждом PR
- Автоматический деплой в staging
- Ручной деплой в продакшен
- Мониторинг и алерты

## Рекомендации по масштабированию

### Краткосрочные улучшения
1. Создать сервисный слой
2. Добавить валидацию с Zod
3. Улучшить обработку ошибок
4. Добавить базовую аутентификацию

### Среднесрочные улучшения
1. Переход на PostgreSQL
2. Добавление Redis для кэширования
3. Реализация real-time обновлений
4. Добавление аналитики

### Долгосрочные улучшения
1. Микросервисная архитектура
2. GraphQL API
3. Мобильное приложение
4. Интеграция с LMS системами

## Инструменты и библиотеки

### Обязательные
- Next.js 15+ (App Router)
- TypeScript
- Tailwind CSS
- Zustand
- SQLite/PostgreSQL
- Zod (валидация)

### Рекомендуемые
- React Query (кэширование)
- React Hook Form (формы)
- Framer Motion (анимации)
- React Testing Library (тесты)
- Husky (pre-commit hooks)

### Опциональные
- Redis (кэширование)
- Sentry (мониторинг ошибок)
- Vercel Analytics (аналитика)
- Stripe (платежи)
