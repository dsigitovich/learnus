# 🚀 Деплой LearnUs на Vercel

## 📋 Предварительные требования

1. **Аккаунт Vercel** - зарегистрируйтесь на [vercel.com](https://vercel.com)
2. **GitHub репозиторий** - ваш код должен быть в GitHub
3. **Переменные окружения** - подготовьте все необходимые ключи

## 🔧 Настройка проекта

### 1. Подготовка переменных окружения

Создайте файл `.env.local` с переменными:

```env
# NextAuth Configuration
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-super-secret-key-here

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# OpenAI API
OPENAI_API_KEY=your-openai-api-key

# Application
NODE_ENV=production
```

### 2. Настройка Google OAuth

1. Перейдите в [Google Cloud Console](https://console.cloud.google.com)
2. Создайте новый проект или выберите существующий
3. Включите Google+ API
4. Создайте OAuth 2.0 credentials
5. Добавьте authorized redirect URIs:
   - `https://your-app.vercel.app/api/auth/callback/google`
   - `http://localhost:3000/api/auth/callback/google` (для разработки)

## 🚀 Деплой через Vercel Dashboard

### 1. Подключение репозитория

1. Войдите в [Vercel Dashboard](https://vercel.com/dashboard)
2. Нажмите "New Project"
3. Выберите ваш GitHub репозиторий
4. Выберите папку `learnus-app` как Root Directory

### 2. Настройка переменных окружения

В настройках проекта добавьте переменные:

```
NEXTAUTH_URL = https://your-app.vercel.app
NEXTAUTH_SECRET = your-super-secret-key-here
GOOGLE_CLIENT_ID = your-google-client-id
GOOGLE_CLIENT_SECRET = your-google-client-secret
OPENAI_API_KEY = your-openai-api-key
NODE_ENV = production
```

### 3. Настройка Build Settings

- **Framework Preset:** Next.js
- **Root Directory:** `learnus-app`
- **Build Command:** `npm run build`
- **Output Directory:** `.next` (автоматически)
- **Install Command:** `npm install`

### 4. Деплой

Нажмите "Deploy" и дождитесь завершения сборки.

## 🛠️ Деплой через CLI

### 1. Установка Vercel CLI

```bash
npm install -g vercel
```

### 2. Логин в Vercel

```bash
vercel login
```

### 3. Инициализация проекта

```bash
cd learnus-app
vercel
```

Следуйте инструкциям:
- Set up and deploy? **Y**
- Which scope? Выберите ваш аккаунт
- Link to existing project? **N**
- What's your project's name? `learnus-app`
- In which directory is your code located? `./`

### 4. Настройка переменных окружения

```bash
vercel env add NEXTAUTH_URL
vercel env add NEXTAUTH_SECRET
vercel env add GOOGLE_CLIENT_ID
vercel env add GOOGLE_CLIENT_SECRET
vercel env add OPENAI_API_KEY
```

### 5. Деплой в продакшен

```bash
vercel --prod
```

## 🔍 Проверка деплоя

После успешного деплоя:

1. **Основное приложение:** `https://your-app.vercel.app`
2. **Health check:** `https://your-app.vercel.app/api/health`
3. **API endpoints:** `https://your-app.vercel.app/api/*`

## 🔄 Автоматические деплои

Vercel автоматически деплоит при:
- Push в ветку `main` (production)
- Push в другие ветки (preview)
- Pull Request (preview)

## 📊 Мониторинг

### Vercel Dashboard
- **Analytics** - метрики производительности
- **Functions** - логи serverless функций
- **Domains** - управление доменами

### Логи
```bash
vercel logs https://your-app.vercel.app
```

## 🗄️ База данных

**Важно:** Vercel использует serverless функции, поэтому SQLite не подходит.

### Варианты для продакшена:

1. **Vercel Postgres** (рекомендуется)
```bash
vercel storage create postgres
```

2. **PlanetScale** (MySQL)
3. **Supabase** (PostgreSQL)
4. **MongoDB Atlas**

### Настройка Vercel Postgres:

1. В Vercel Dashboard перейдите в Storage
2. Создайте Postgres database
3. Скопируйте connection string
4. Добавьте в переменные окружения:
```
DATABASE_URL = postgresql://...
```

## 🔧 Troubleshooting

### Проблемы с сборкой

```bash
# Локальная проверка сборки
npm run build

# Проверка типов
npm run type-check

# Линтинг
npm run lint
```

### Проблемы с переменными окружения

```bash
# Проверка переменных
vercel env ls

# Обновление переменной
vercel env add VARIABLE_NAME
```

### Проблемы с OAuth

1. Проверьте redirect URIs в Google Console
2. Убедитесь, что `NEXTAUTH_URL` соответствует домену Vercel
3. Проверьте `NEXTAUTH_SECRET`

## 📈 Оптимизация

### Performance
- Используйте Vercel Analytics
- Оптимизируйте изображения с `next/image`
- Настройте кэширование

### Cost
- **Hobby Plan** - бесплатно (ограничения)
- **Pro Plan** - $20/месяц (больше функций)

## 🔐 Безопасность

1. **Никогда не коммитьте** `.env.local`
2. Используйте **сильные секреты** для `NEXTAUTH_SECRET`
3. Ограничьте **CORS** настройки
4. Регулярно **обновляйте зависимости**

## 📞 Поддержка

- **Vercel Docs:** [vercel.com/docs](https://vercel.com/docs)
- **Vercel Community:** [github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)
- **Next.js Docs:** [nextjs.org/docs](https://nextjs.org/docs)

---

**Удачного деплоя! 🎉**

Ваше приложение будет доступно по адресу: `https://your-app.vercel.app`

