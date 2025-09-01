# Шаблоны для разработки

Этот каталог содержит шаблоны для быстрого создания новых компонентов и API endpoints в соответствии с архитектурными правилами проекта.

## Доступные шаблоны

### 1. Компонент React (`component-template.tsx`)

Шаблон для создания новых React компонентов с:
- TypeScript типизацией
- Состоянием и эффектами
- Обработкой ошибок
- Loading состояниями
- Интеграцией с Zustand store
- Современным UI с Tailwind CSS

#### Использование:
1. Скопируйте `component-template.tsx`
2. Переименуйте в `YourComponentName.tsx`
3. Замените `ComponentName` на ваше название
4. Настройте типы и логику под ваши нужды

#### Пример:
```bash
cp templates/component-template.tsx components/features/MyFeature/MyComponent.tsx
```

### 2. API Route (`api-route-template.ts`)

Шаблон для создания новых API endpoints с:
- Валидацией с помощью Zod
- Обработкой всех HTTP методов (GET, POST, PUT, DELETE)
- Единообразной обработкой ошибок
- Работой с базой данных
- TypeScript типизацией

#### Использование:
1. Скопируйте `api-route-template.ts`
2. Переименуйте в `route.ts` в нужной папке API
3. Настройте схемы валидации
4. Измените SQL запросы под вашу таблицу

#### Пример:
```bash
cp templates/api-route-template.ts app/api/my-feature/route.ts
```

## Структура шаблонов

### Компонент React

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';

// 1. Типы
interface ComponentProps {
  // props
}

// 2. Компонент
export default function ComponentName(props: ComponentProps) {
  // 3. Состояние
  const [state, setState] = useState();
  
  // 4. Store
  const { data, setData } = useStore();
  
  // 5. Эффекты
  useEffect(() => {
    // side effects
  }, []);
  
  // 6. Обработчики
  const handleAction = () => {
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

### API Route

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { openDb } from '@/lib/db';

// 1. Схемы валидации
const Schema = z.object({
  // fields
});

// 2. Вспомогательные функции
function handleApiError(error: unknown): NextResponse {
  // error handling
}

// 3. HTTP методы
export async function GET(request: NextRequest) {
  // GET logic
}

export async function POST(request: NextRequest) {
  // POST logic
}
```

## Рекомендации по использованию

### Для компонентов:

1. **Именование**: Используйте PascalCase для названий компонентов
2. **Типизация**: Всегда определяйте интерфейсы для props
3. **Состояние**: Используйте локальное состояние для UI, глобальное для данных
4. **Обработка ошибок**: Всегда обрабатывайте ошибки в async операциях
5. **Loading состояния**: Показывайте индикаторы загрузки для лучшего UX

### Для API routes:

1. **Валидация**: Всегда валидируйте входные данные с Zod
2. **Обработка ошибок**: Используйте единообразную обработку ошибок
3. **HTTP методы**: Реализуйте только нужные методы
4. **База данных**: Всегда закрывайте соединения с БД
5. **Безопасность**: Используйте параметризованные запросы

## Кастомизация шаблонов

### Добавление новых полей в компонент:

```typescript
interface ComponentProps {
  title: string;
  description?: string;
  // Добавьте новые поля здесь
  newField: string;
  optionalField?: number;
}
```

### Изменение схемы валидации в API:

```typescript
const CreateDataSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().optional(),
  // Добавьте новые поля
  email: z.string().email(),
  age: z.number().min(0).max(120),
});
```

### Добавление новых таблиц:

```typescript
// Измените SQL запросы под вашу таблицу
const result = await db.run(
  `INSERT INTO your_table_name (field1, field2, created_at) 
   VALUES (?, ?, CURRENT_TIMESTAMP)`,
  [value1, value2]
);
```

## Лучшие практики

### Компоненты:
- Разделяйте логику и представление
- Используйте кастомные хуки для сложной логики
- Оптимизируйте ре-рендеры с помощью React.memo
- Используйте TypeScript для всех компонентов

### API:
- Следуйте RESTful принципам
- Возвращайте единообразные ответы
- Логируйте важные операции
- Используйте правильные HTTP статус коды

### Общие:
- Пишите тесты для новой функциональности
- Обновляйте документацию
- Следуйте архитектурным правилам проекта
- Проводите код-ревью перед слиянием

## Примеры использования

### Создание компонента списка программ:

```bash
# Копируем шаблон
cp templates/component-template.tsx components/features/programs/ProgramList.tsx

# Редактируем компонент
# - Изменяем название на ProgramList
# - Добавляем типы для программ
# - Реализуем логику загрузки списка
# - Добавляем UI для отображения программ
```

### Создание API для управления программами:

```bash
# Копируем шаблон
cp templates/api-route-template.ts app/api/programs/route.ts

# Редактируем API
# - Настраиваем схемы валидации для программ
# - Изменяем SQL запросы для таблицы learning_programs
# - Добавляем специфичную логику для программ
```

## Поддержка

Если у вас есть вопросы по использованию шаблонов или нужны дополнительные шаблоны, создайте issue в репозитории или обратитесь к команде разработки.
