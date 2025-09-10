# 🚀 Быстрый старт LearnUs

## Локальная разработка

1. **Установка зависимостей:**
```bash
npm install
```

2. **Настройка переменных окружения:**
```bash
cp env.example .env.local
# Отредактируйте .env.local с вашими значениями
```

3. **Инициализация базы данных:**
```bash
npm run db:init
```

4. **Запуск в режиме разработки:**
```bash
npm run dev
```

Приложение будет доступно по адресу: http://localhost:3000

## Docker деплой

1. **Быстрый деплой:**
```bash
./scripts/deploy.sh
```

2. **Или пошагово:**
```bash
# Проверка переменных окружения
npm run deploy:env

# Сборка приложения
npm run deploy:build

# Сборка Docker образа
npm run deploy:docker

# Полный деплой
npm run deploy
```

## Проверка работоспособности

- **Health check:** http://localhost:3000/api/health
- **Основное приложение:** http://localhost:3000

## Полезные команды

```bash
# Остановка Docker контейнера
npm run docker:stop

# Просмотр логов
docker logs learnus-app

# Перезапуск
docker restart learnus-app
```

## Переменные окружения

Обязательные переменные в `.env.local`:
- `NEXTAUTH_SECRET` - секретный ключ для NextAuth
- `GOOGLE_CLIENT_ID` - Google OAuth Client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth Client Secret
- `OPENAI_API_KEY` - OpenAI API ключ

Подробная документация: [DEPLOYMENT.md](./DEPLOYMENT.md)
