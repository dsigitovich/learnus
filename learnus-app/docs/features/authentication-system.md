# Система аутентификации и пользователей

## Обзор
Система аутентификации через Google OAuth для платформы LearnUs, обеспечивающая безопасный доступ к образовательному контенту и персонализированный опыт обучения.

## Приоритет
**КРИТИЧЕСКИЙ** ⚠️ - Базовый функционал для работы приложения

## Цели
- Обеспечить безопасный вход через Google аккаунт
- Создать систему профилей для персонализации обучения
- Реализовать управление сессиями и безопасность
- Упростить процесс регистрации для пользователей

## Функциональные требования

### 1. Google OAuth аутентификация
- **Вход через Google аккаунт**:
  - Кнопка "Войти через Google"
  - Автоматическое получение данных профиля
  - Обработка разрешений Google
- **Автоматическая регистрация** при первом входе
- **Обработка ошибок** OAuth (отмена, недоступность сервиса)
- **Защита от повторного входа** в существующую сессию

### 2. Управление сессиями
- **Автоматическое создание** пользователя при первом входе
- **JWT токены** для аутентификации
- **Автоматический выход** при истечении токена
- **Защита от CSRF** атак

### 3. Управление профилями
- **Базовая информация**:
  - Аватар (загрузка изображений)
  - Имя и фамилия
  - Дата рождения
  - Краткая биография
- **Образовательные предпочтения**:
  - Уровень знаний (Beginner/Intermediate/Advanced)
  - Интересующие темы
  - Цели обучения
- **Настройки приватности** и уведомлений

### 4. Безопасность
- **JWT токены** для аутентификации
- **Refresh токены** для продления сессий
- **Автоматический выход** при истечении токена
- **Защита от CSRF** атак
- **Верификация Google токенов** на сервере

### 5. Управление аккаунтом
- **Связывание с Google аккаунтом** (один Google аккаунт = один профиль)
- **Автоматическое обновление** данных при изменении в Google
- **Возможность отвязки** Google аккаунта (с подтверждением)

## Технические требования

### Технологии
- **NextAuth.js** для интеграции Google OAuth
- **Google OAuth 2.0** для аутентификации
- **SQLite** для хранения данных пользователей
- **JWT** для токенов аутентификации
- **Zod** для валидации данных

### Структура базы данных
```sql
-- Таблица пользователей
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  google_id TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  level TEXT DEFAULT 'Beginner',
  interests TEXT[], -- JSON массив
  email_verified BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Таблица сессий
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Таблица связей с Google
CREATE TABLE google_connections (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  google_id TEXT UNIQUE NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  expires_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### API Endpoints
```
GET  /api/auth/signin      - Инициация Google OAuth
GET  /api/auth/signout     - Выход из системы
GET  /api/auth/session     - Получение текущей сессии
GET  /api/auth/me          - Получение профиля пользователя
PUT  /api/auth/profile     - Обновление профиля
DELETE /api/auth/account   - Удаление аккаунта
```

## UI/UX требования

### Компоненты
- **GoogleSignInButton** - кнопка входа через Google
- **UserProfile** - страница профиля пользователя
- **AuthGuard** - защита роутов
- **UserMenu** - выпадающее меню пользователя

### Дизайн
- **Адаптивный интерфейс** для мобильных устройств
- **Кнопка Google Sign-In** в фирменном стиле Google
- **Индикаторы загрузки** для OAuth процесса
- **Темная/светлая тема** (интеграция с существующей системой)

## Интеграция с существующим кодом

### Расширение типов
```typescript
// Добавить в lib/types/index.ts
export interface User {
  id: string;
  googleId: string;
  email: string;
  name: string;
  avatarUrl?: string;
  bio?: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  interests: string[];
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface GoogleProfile {
  sub: string; // Google ID
  email: string;
  name: string;
  picture: string;
  email_verified: boolean;
}
```

### Интеграция с Zustand store
- Расширить существующий store для управления аутентификацией
- Добавить методы для Google OAuth входа/выхода
- Интегрировать с существующей системой чатов и курсов
- Автоматическое обновление профиля при изменении в Google

## Тестирование

### Unit тесты
- Валидация Google профилей
- Обработка OAuth токенов
- Генерация JWT токенов

### Integration тесты
- API endpoints
- База данных
- NextAuth.js интеграция

### E2E тесты
- Полный flow Google OAuth входа
- Автоматическое создание профиля
- Обновление профиля

## Безопасность

### Защита от атак
- **SQL Injection** - параметризованные запросы
- **XSS** - санитизация пользовательского ввода
- **CSRF** - токены защиты
- **OAuth Token Hijacking** - верификация Google токенов
- **Session Hijacking** - безопасные JWT токены

### Соответствие стандартам
- **OWASP Top 10** рекомендации
- **GDPR** для обработки персональных данных
- **Политика конфиденциальности** и cookies

## Мониторинг и логирование

### Логирование
- Попытки Google OAuth входа (успешные/неуспешные)
- Создание новых пользователей через OAuth
- Обновление профилей из Google
- Подозрительная активность

### Метрики
- Количество активных пользователей
- Конверсия Google OAuth входа
- Время сессии
- Популярные функции

## Развертывание

### Переменные окружения
```env
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
DATABASE_URL=file:./learnus.db
```

### Миграции базы данных
- Скрипт инициализации таблиц пользователей и Google связей
- Миграция существующих данных (если есть)
- Создание индексов для Google ID и email

## Критерии готовности

### MVP (Минимально жизнеспособный продукт)
- [ ] Google OAuth вход
- [ ] Автоматическое создание профилей
- [ ] JWT аутентификация
- [ ] Защита роутов

### Полная версия
- [ ] Управление Google связями
- [ ] Автоматическое обновление профилей
- [ ] Расширенные настройки профиля
- [ ] Полное тестирование
- [ ] Документация API

## Риски и ограничения

### Технические риски
- **Производительность** - оптимизация запросов к БД
- **Масштабируемость** - переход на PostgreSQL при росте
- **Безопасность** - регулярные аудиты безопасности

### Бизнес риски
- **Зависимость от Google** - доступность OAuth сервиса
- **Соответствие требованиям** - GDPR и другие регуляторные требования
- **Ограничения Google** - лимиты API и политики

## Следующие шаги

1. **Установка зависимостей** (NextAuth.js)
2. **Создание Google OAuth приложения** в Google Cloud Console
3. **Создание схемы БД** для пользователей и Google связей
4. **Настройка NextAuth.js** с Google провайдером
5. **Разработка UI компонентов** для Google OAuth
6. **Интеграция** с существующей системой
7. **Тестирование** и отладка
8. **Документация** и развертывание
