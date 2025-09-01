# Правила разработки Learnus

## Основные принципы

### 1. Чистый код
- Пишите код, который легко читать и понимать
- Используйте описательные имена переменных и функций
- Комментируйте сложную логику
- Следуйте принципу DRY (Don't Repeat Yourself)

### 2. TypeScript
- Используйте строгий режим TypeScript
- Определяйте типы для всех данных
- Избегайте `any` типа
- Используйте интерфейсы для объектов

### 3. Компонентный подход
- Создавайте переиспользуемые компоненты
- Разделяйте ответственность между компонентами
- Используйте композицию вместо наследования

## Рабочий процесс

### 1. Создание новой функциональности

#### Шаг 1: Планирование
```bash
# Создайте issue в GitHub/GitLab
# Опишите требования и критерии приемки
# Оцените сложность задачи
```

#### Шаг 2: Создание ветки
```bash
git checkout -b feature/название-функции
# или
git checkout -b fix/название-бага
```

#### Шаг 3: Разработка
- Следуйте архитектурным правилам
- Пишите тесты для новой функциональности
- Обновляйте документацию при необходимости

#### Шаг 4: Код-ревью
- Создайте Pull Request
- Попросите коллег провести ревью
- Исправьте замечания

#### Шаг 5: Слияние
- Получите approval от ревьюера
- Слейте ветку в main/develop

### 2. Коммиты

#### Правила именования коммитов
```
тип(область): краткое описание

feat(chat): добавить поддержку групповых чатов
fix(api): исправить ошибку валидации в progress endpoint
docs(readme): обновить инструкции по установке
style(components): улучшить стили кнопок
refactor(store): вынести логику в отдельный сервис
test(api): добавить тесты для chat endpoint
chore(deps): обновить зависимости
```

#### Типы коммитов
- `feat`: новая функциональность
- `fix`: исправление бага
- `docs`: изменения в документации
- `style`: форматирование кода
- `refactor`: рефакторинг кода
- `test`: добавление тестов
- `chore`: обновление зависимостей, конфигурации

### 3. Code Review

#### Что проверять
- Соответствие архитектурным правилам
- Качество кода и читаемость
- Покрытие тестами
- Производительность
- Безопасность

#### Комментарии в PR
- Будьте конструктивными
- Предлагайте альтернативные решения
- Отмечайте хорошие решения
- Задавайте вопросы, если что-то неясно

## Качество кода

### 1. Линтеры и форматтеры

#### ESLint
```json
{
  "extends": [
    "next/core-web-vitals",
    "@typescript-eslint/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "warn"
  }
}
```

#### Prettier
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
```

### 2. Pre-commit хуки

#### Husky
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "commit-msg": "commitlint -E HUSKY_GIT_PARAMS"
    }
  }
}
```

#### lint-staged
```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```

### 3. Тестирование

#### Unit тесты
```typescript
// services/program-service.test.ts
describe('ProgramService', () => {
  it('should create a new program', async () => {
    const service = new ProgramService();
    const result = await service.createProgram(mockData);
    
    expect(result).toHaveProperty('id');
    expect(result.title).toBe(mockData.title);
  });
});
```

#### Integration тесты
```typescript
// api/programs.test.ts
describe('POST /api/programs', () => {
  it('should create a program', async () => {
    const response = await request(app)
      .post('/api/programs')
      .send(validProgramData);
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
  });
});
```

## Производительность

### 1. React оптимизации

#### Мемоизация
```typescript
// Используйте React.memo для тяжелых компонентов
const ExpensiveComponent = React.memo(({ data }) => {
  return <div>{/* рендер */}</div>;
});

// Используйте useMemo для дорогих вычислений
const expensiveValue = useMemo(() => {
  return heavyCalculation(data);
}, [data]);

// Используйте useCallback для функций
const handleClick = useCallback(() => {
  // логика
}, [dependencies]);
```

#### Lazy loading
```typescript
// Lazy load компоненты
const LazyComponent = lazy(() => import('./LazyComponent'));

// Lazy load страницы
const ProgramPage = lazy(() => import('./pages/ProgramPage'));
```

### 2. API оптимизации

#### Кэширование
```typescript
// Используйте React Query для кэширования
const { data, isLoading } = useQuery({
  queryKey: ['programs'],
  queryFn: fetchPrograms,
  staleTime: 5 * 60 * 1000, // 5 минут
});
```

#### Пагинация
```typescript
// Используйте пагинацию для больших списков
const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
  queryKey: ['programs'],
  queryFn: ({ pageParam = 1 }) => fetchPrograms(pageParam),
  getNextPageParam: (lastPage) => lastPage.nextPage,
});
```

## Безопасность

### 1. Валидация данных

#### Zod схемы
```typescript
import { z } from 'zod';

const CreateProgramSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().optional(),
  nodes: z.array(z.object({
    title: z.string().min(1),
    content: z.string().optional(),
  })).min(1),
});

type CreateProgramData = z.infer<typeof CreateProgramSchema>;
```

#### API валидация
```typescript
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = CreateProgramSchema.parse(body);
    
    // обработка данных
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    throw error;
  }
}
```

### 2. Аутентификация

#### JWT токены
```typescript
// Создание токена
const token = jwt.sign(
  { userId: user.id, role: user.role },
  process.env.JWT_SECRET!,
  { expiresIn: '24h' }
);

// Проверка токена
const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!);
  } catch (error) {
    throw new Error('Invalid token');
  }
};
```

### 3. Защита от атак

#### SQL Injection
```typescript
// ✅ Правильно - используйте параметризованные запросы
await db.run(
  'SELECT * FROM programs WHERE id = ?',
  [programId]
);

// ❌ Неправильно - конкатенация строк
await db.run(
  `SELECT * FROM programs WHERE id = ${programId}`
);
```

#### XSS Protection
```typescript
// ✅ Правильно - экранируйте пользовательский ввод
const sanitizedContent = DOMPurify.sanitize(userContent);

// ❌ Неправильно - прямой рендер пользовательского ввода
<div dangerouslySetInnerHTML={{ __html: userContent }} />
```

## Мониторинг и логирование

### 1. Логирование

#### Структурированные логи
```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

// Использование
logger.info('User created program', {
  userId: user.id,
  programId: program.id,
  timestamp: new Date().toISOString(),
});
```

### 2. Мониторинг ошибок

#### Sentry интеграция
```typescript
import * as Sentry from '@sentry/nextjs';

// Инициализация
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});

// Отправка ошибок
try {
  // код
} catch (error) {
  Sentry.captureException(error);
  throw error;
}
```

## Документация

### 1. README файлы

#### Структура README
```markdown
# Название проекта

## Описание
Краткое описание проекта

## Установка
```bash
npm install
npm run dev
```

## Использование
Примеры использования

## API
Документация API

## Разработка
Инструкции для разработчиков

## Лицензия
MIT
```

### 2. JSDoc комментарии

#### Документирование функций
```typescript
/**
 * Создает новую учебную программу
 * @param data - Данные для создания программы
 * @param userId - ID пользователя
 * @returns Promise<LearningProgram>
 * @throws {ValidationError} Если данные некорректны
 * @throws {DatabaseError} Если ошибка БД
 */
async function createProgram(
  data: CreateProgramData,
  userId: string
): Promise<LearningProgram> {
  // реализация
}
```

### 3. API документация

#### OpenAPI/Swagger
```yaml
openapi: 3.0.0
info:
  title: Learnus API
  version: 1.0.0
paths:
  /api/programs:
    post:
      summary: Создать программу
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateProgram'
      responses:
        '201':
          description: Программа создана
```

## Развертывание

### 1. Environment variables

#### .env.local
```bash
# База данных
DATABASE_URL=file:./learnus.db

# OpenAI
OPENAI_API_KEY=your-api-key

# JWT
JWT_SECRET=your-secret-key

# Мониторинг
SENTRY_DSN=your-sentry-dsn
```

### 2. Docker

#### Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### 3. CI/CD

#### GitHub Actions
```yaml
name: CI/CD

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test
      - run: npm run lint
      - run: npm run build
```

## Заключение

Следование этим правилам поможет:
- Поддерживать высокое качество кода
- Упростить работу в команде
- Ускорить разработку
- Снизить количество багов
- Улучшить производительность приложения

Регулярно пересматривайте и обновляйте эти правила в соответствии с развитием проекта и технологий.
