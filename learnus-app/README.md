# Learnus - Платформа для создания учебных программ

Интерактивная платформа для создания и прохождения персонализированных учебных программ с использованием AI и Сократовского метода обучения.

## 🚀 Новая архитектура

Проект был полностью рефакторен согласно принципам чистой архитектуры:

### Слоистая архитектура
- **Presentation Layer**: React компоненты и страницы
- **Business Logic Layer**: Сервисы и кастомные хуки
- **Data Access Layer**: API routes с валидацией
- **Infrastructure Layer**: База данных и внешние API

### Ключевые улучшения
- ✅ **Сервисный слой** для инкапсуляции бизнес-логики
- ✅ **Строгая типизация** TypeScript
- ✅ **Валидация данных** с Zod
- ✅ **Централизованная обработка ошибок**
- ✅ **Zustand store** с разделением на слайсы
- ✅ **Кастомные хуки** для управления состоянием
- ✅ **Утилиты и хелперы** для общих операций

## 📁 Структура проекта

```
learnus-app/
├── app/                    # Next.js App Router
│   ├── api/                # API endpoints
│   └── ...
├── components/             # React компоненты
│   ├── ui/                 # Базовые UI компоненты
│   ├── features/           # Функциональные компоненты
│   └── layout/             # Компоненты макета
├── lib/                    # Библиотеки и утилиты
│   ├── services/           # Бизнес-логика
│   ├── hooks/              # Кастомные хуки
│   ├── utils/              # Утилиты
│   ├── db/                 # Работа с БД
│   └── types/              # TypeScript типы
├── store/                  # Zustand store
│   └── slices/             # Слайсы состояния
└── scripts/                # Вспомогательные скрипты
```

## 🛠 Установка и запуск

### 1. Клонирование репозитория
```bash
git clone https://github.com/your-username/learnus.git
cd learnus/learnus-app
```

### 2. Установка зависимостей
```bash
npm install
```

### 3. Настройка переменных окружения
```bash
cp .env.example .env.local
```

Отредактируйте `.env.local` и добавьте ваш OpenAI API ключ:
```
OPENAI_API_KEY=your-openai-api-key-here
```

### 4. Инициализация базы данных
```bash
npm run db:init
```

### 5. Запуск приложения
```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000) в браузере.

## 📚 API Documentation

### Программы обучения

#### GET /api/programs
Получить список всех программ

#### POST /api/programs
Создать новую программу
```json
{
  "title": "Название программы",
  "description": "Описание программы"
}
```

#### GET /api/programs/[id]
Получить программу с узлами

#### PATCH /api/programs/[id]
Обновить программу

#### DELETE /api/programs/[id]
Удалить программу

### Узлы программы

#### POST /api/programs/[id]/nodes
Создать узел в программе

#### PATCH /api/nodes/[id]
Обновить узел

#### DELETE /api/nodes/[id]
Удалить узел

### Прогресс обучения

#### GET /api/nodes/[id]/progress
Получить прогресс узла

#### PUT /api/nodes/[id]/progress
Обновить прогресс узла
```json
{
  "status": "in_progress" | "completed",
  "notes": "Заметки"
}
```

### Чат с AI

#### POST /api/chat
Отправить сообщение в чат
```json
{
  "messages": [{"role": "user", "content": "Сообщение"}],
  "nodeId": 123,
  "nodeContent": "Контент узла"
}
```

### Генерация программы

#### POST /api/programs/generate
Генерировать программу с помощью AI
```json
{
  "topic": "Тема для изучения",
  "autoCreate": true
}
```

## 🧩 Использование хуков

### usePrograms
```typescript
import { usePrograms } from '@/lib/hooks';

function MyComponent() {
  const { programs, isLoading, createProgram } = usePrograms();
  
  const handleCreate = async () => {
    await createProgram({
      title: 'Новая программа',
      description: 'Описание'
    });
  };
}
```

### useChat
```typescript
import { useChat } from '@/lib/hooks';

function ChatComponent() {
  const { messages, sendMessage, isTyping } = useChat();
  
  const handleSend = async (text: string) => {
    await sendMessage(text);
  };
}
```

### useProgress
```typescript
import { useProgress } from '@/lib/hooks';

function ProgressComponent() {
  const { stats, updateProgress } = useProgress();
  
  const markCompleted = async (nodeId: number) => {
    await updateProgress(nodeId, 'completed');
  };
}
```

## 🧪 Тестирование

```bash
# Проверка типов
npm run type-check

# Линтинг
npm run lint

# Запуск тестов (будет добавлено)
npm test
```

## 🚀 Деплой

### Vercel (рекомендуется)
```bash
# Установка Vercel CLI
npm i -g vercel

# Деплой
vercel
```

### Docker
```bash
# Сборка образа
docker build -t learnus .

# Запуск контейнера
docker run -p 3000:3000 learnus
```

## 📈 Roadmap

- [ ] Аутентификация пользователей
- [ ] Мультиязычность
- [ ] Экспорт/импорт программ
- [ ] Совместная работа
- [ ] Мобильное приложение
- [ ] Интеграция с LMS системами

## 🤝 Вклад в проект

1. Fork репозитория
2. Создайте ветку для функции (`git checkout -b feature/AmazingFeature`)
3. Commit изменения (`git commit -m 'Add some AmazingFeature'`)
4. Push в ветку (`git push origin feature/AmazingFeature`)
5. Откройте Pull Request

## 📄 Лицензия

MIT License - см. файл [LICENSE](../LICENSE) для деталей.

## 👥 Авторы

- Дмитрий Сигитов - [GitHub](https://github.com/dmitriysigitov)

## 🙏 Благодарности

- OpenAI за API для генерации контента
- Next.js команде за отличный фреймворк
- Всем контрибьюторам проекта
