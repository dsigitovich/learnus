# 🚀 Быстрый деплой на Vercel

## ✅ Готово к деплою!

Ваше приложение LearnUs готово к деплою на Vercel. Все необходимые файлы созданы и настроены.

## 🚀 Шаги для деплоя:

### 1. Подготовьте переменные окружения

Создайте файл `.env.local` с вашими ключами:

```env
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-super-secret-key-here
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
OPENAI_API_KEY=your-openai-api-key
NODE_ENV=production
```

### 2. Настройте Google OAuth

1. Перейдите в [Google Cloud Console](https://console.cloud.google.com)
2. Создайте OAuth 2.0 credentials
3. Добавьте redirect URI: `https://your-app.vercel.app/api/auth/callback/google`

### 3. Деплой через Vercel Dashboard

1. Войдите в [Vercel Dashboard](https://vercel.com/dashboard)
2. Нажмите "New Project"
3. Выберите ваш GitHub репозиторий
4. Установите Root Directory: `learnus-app`
5. Добавьте переменные окружения в настройках проекта
6. Нажмите "Deploy"

### 4. Или через CLI

```bash
# Логин в Vercel
vercel login

# Деплой
vercel --prod
```

## 🔍 Проверка деплоя

После деплоя проверьте:
- **Основное приложение:** `https://your-app.vercel.app`
- **Health check:** `https://your-app.vercel.app/api/health`
- **Авторизация:** `https://your-app.vercel.app/auth/signin`

## 📋 Что настроено:

✅ **Docker контейнеризация** - для локальной разработки  
✅ **Vercel конфигурация** - `vercel.json`  
✅ **Database адаптеры** - SQLite для локальной разработки, Mock для Vercel  
✅ **Health check endpoint** - `/api/health`  
✅ **Автоматические деплои** - через GitHub Actions  
✅ **Переменные окружения** - примеры в `env.example`  

## 🗄️ База данных

**Важно:** Vercel использует serverless функции, поэтому SQLite не подходит для продакшена.

### Рекомендуемые варианты:
1. **Vercel Postgres** (самый простой)
2. **PlanetScale** (MySQL)
3. **Supabase** (PostgreSQL)

### Настройка Vercel Postgres:
1. В Vercel Dashboard → Storage → Create Postgres
2. Скопируйте connection string
3. Добавьте `DATABASE_URL` в переменные окружения

## 🔧 Troubleshooting

### Проблемы с сборкой:
```bash
npm run build  # Проверка локальной сборки
```

### Проблемы с OAuth:
- Проверьте redirect URIs в Google Console
- Убедитесь, что `NEXTAUTH_URL` соответствует домену Vercel

### Проблемы с переменными:
```bash
vercel env ls  # Просмотр переменных
vercel env add VARIABLE_NAME  # Добавление переменной
```

## 📚 Документация

- **Подробная инструкция:** [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)
- **Общий деплой:** [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Vercel Docs:** [vercel.com/docs](https://vercel.com/docs)

---

**Удачного деплоя! 🎉**

Ваше приложение будет доступно по адресу: `https://your-app.vercel.app`

