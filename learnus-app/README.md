# Learnus - Минимальный чат с AI

Простое приложение для чата с AI на основе Next.js и OpenAI API.

## Установка

1. Клонируйте репозиторий
2. Установите зависимости:
```bash
npm install
```

3. Создайте файл `.env.local` и добавьте ваш OpenAI API ключ:
```bash
cp .env.local.example .env.local
```

Отредактируйте `.env.local` и добавьте ваш ключ:
```
OPENAI_API_KEY=your-actual-api-key
```

## Запуск

```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000) в браузере.

## Функции

- Чат с AI помощником
- Сократовский метод обучения (AI задает наводящие вопросы)
- Минималистичный интерфейс

## Технологии

- Next.js 15
- TypeScript
- Tailwind CSS
- OpenAI API
- Zustand для управления состоянием