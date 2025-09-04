# Быстрый старт: Google авторизация в LearnUs

## Что было реализовано

### ✅ Минимально рабочая Google авторизация включает:

1. **NextAuth.js интеграция**
   - Настроен Google OAuth провайдер
   - Создан кастомный SQLite адаптер
   - Настроены API роуты для аутентификации

2. **База данных**
   - Создана схема для пользователей, сессий и аккаунтов
   - Инициализационный скрипт: `scripts/init-auth-db.ts`
   - Поддержка Google ID и дополнительных полей профиля

3. **Domain Layer (DDD)**
   - Entity: `User` с поддержкой Google аутентификации
   - Value Objects: `UserId`, `GoogleId`, `UserLevel`, `Email`
   - Repository: `UserRepository` с полной реализацией

4. **UI компоненты**
   - `GoogleSignInButton` - кнопка входа через Google
   - `UserMenu` - меню пользователя с аватаром
   - `AuthGuard` - защита роутов
   - Страницы: `/auth/signin`, `/auth/error`

5. **API endpoints**
   - `GET /api/auth/me` - получение профиля текущего пользователя
   - `PUT /api/auth/profile` - обновление профиля

6. **Интеграция с Zustand**
   - Добавлено управление состоянием аутентификации
   - Хук `useAuth` для работы с пользователем
   - Автоматическая синхронизация с NextAuth сессией

## Как запустить

### 1. Настройте Google OAuth
Следуйте инструкциям в `/docs/GOOGLE_OAUTH_SETUP.md`

### 2. Обновите переменные окружения
В файле `.env.local`:
```env
GOOGLE_CLIENT_ID=ваш-client-id
GOOGLE_CLIENT_SECRET=ваш-client-secret
```

### 3. Запустите приложение
```bash
npm run dev
```

### 4. Откройте в браузере
- http://localhost:3000 - вас перенаправит на страницу входа
- Нажмите "Войти через Google"
- После входа вы попадете на главную страницу

## Структура файлов

```
learnus-app/
├── app/
│   ├── api/auth/
│   │   ├── [...nextauth]/route.ts  # NextAuth API
│   │   ├── me/route.ts              # Получение профиля
│   │   └── profile/route.ts         # Обновление профиля
│   └── auth/
│       ├── signin/page.tsx          # Страница входа
│       └── error/page.tsx           # Страница ошибок
├── components/auth/
│   ├── GoogleSignInButton.tsx       # Кнопка Google
│   ├── UserMenu.tsx                 # Меню пользователя
│   └── AuthGuard.tsx                # Защита роутов
├── src/
│   ├── domain/
│   │   ├── entities/User.ts         # User entity
│   │   └── value-objects/           # Value objects
│   └── infrastructure/
│       └── database/
│           └── UserRepository.ts    # Репозиторий
├── lib/
│   ├── auth.ts                      # Конфигурация NextAuth
│   └── hooks/useAuth.ts             # Хук для аутентификации
└── middleware.ts                    # Защита API роутов
```

## Что можно улучшить

1. **Добавить обработку ошибок** при неудачной авторизации
2. **Создать страницу профиля** для редактирования данных
3. **Добавить роли и права доступа**
4. **Настроить email уведомления**
5. **Добавить логирование** входов и активности

## Тестирование

Минимальная проверка работоспособности:
1. Вход через Google работает
2. Сессия сохраняется после перезагрузки
3. Выход из системы работает
4. Защищенные роуты требуют авторизацию
5. API endpoints доступны только авторизованным пользователям