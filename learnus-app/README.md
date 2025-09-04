# LearnUs - Платформа для обучения с помощью AI

Образовательная платформа с AI-помощником, поддержкой курсов и аутентификацией через Google.

## Установка

1. Клонируйте репозиторий
2. Установите зависимости:
```bash
npm install
```

3. Создайте файл `.env.local` на основе примера:
```bash
cp .env.local.example .env.local
```

4. Настройте переменные окружения в `.env.local`:
```
# OpenAI
OPENAI_API_KEY=your-openai-api-key

# NextAuth
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

5. Инициализируйте базу данных:
```bash
node scripts/init-db.js
```

6. Настройте Google OAuth (см. [docs/setup-google-oauth.md](docs/setup-google-oauth.md))

## Запуск

```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000) в браузере.

## Функции

- **Аутентификация через Google OAuth** - безопасный вход с помощью Google аккаунта
- **Персональные профили** - настройка уровня знаний и интересов
- **AI помощник** - интеллектуальный чат-бот для обучения
- **Создание курсов** - автоматическая генерация учебных программ
- **Интерактивное обучение** - пошаговое прохождение уроков
- **Сократовский метод** - AI задает наводящие вопросы для лучшего понимания
- **Сохранение прогресса** - все данные сохраняются в профиле пользователя
- **Темная тема** - поддержка светлой и темной темы

## Технологии

- **Next.js 15** - React фреймворк
- **TypeScript** - типизированный JavaScript
- **Tailwind CSS** - утилитарный CSS фреймворк
- **NextAuth.js** - аутентификация для Next.js
- **Google OAuth 2.0** - безопасная авторизация
- **SQLite + Better-SQLite3** - локальная база данных
- **OpenAI API** - искусственный интеллект
- **Zustand** - управление состоянием

## Структура проекта

```
learnus-app/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── auth/         # NextAuth endpoints
│   │   └── chat/         # Chat API
│   ├── auth/             # Auth pages
│   └── profile/          # User profile
├── components/            # React компоненты
│   └── auth/             # Auth компоненты
├── lib/                   # Утилиты и конфигурация
│   ├── auth/             # Auth конфигурация
│   ├── db/               # База данных
│   └── types/            # TypeScript типы
├── hooks/                 # React hooks
├── scripts/              # Утилиты
└── docs/                 # Документация
```