# Настройка Google OAuth для LearnUs

## Шаги по настройке Google OAuth

### 1. Создание проекта в Google Cloud Console

1. Перейдите на [Google Cloud Console](https://console.cloud.google.com/)
2. Создайте новый проект или выберите существующий
3. Название проекта: "LearnUs" (или любое другое)

### 2. Включение Google+ API

1. В боковом меню выберите "APIs & Services" → "Library"
2. Найдите "Google+ API" и включите его
3. Также включите "Google Identity Toolkit API"

### 3. Создание OAuth 2.0 учетных данных

1. Перейдите в "APIs & Services" → "Credentials"
2. Нажмите "Create Credentials" → "OAuth client ID"
3. Если требуется, настройте OAuth consent screen:
   - User Type: External
   - App name: LearnUs
   - User support email: ваш email
   - Developer contact: ваш email
   - Scopes: email, profile, openid

### 4. Настройка OAuth client

1. Application type: Web application
2. Name: LearnUs Web Client
3. Authorized JavaScript origins:
   - http://localhost:3000 (для разработки)
   - https://your-domain.com (для продакшена)
4. Authorized redirect URIs:
   - http://localhost:3000/api/auth/callback/google (для разработки)
   - https://your-domain.com/api/auth/callback/google (для продакшена)

### 5. Получение учетных данных

После создания вы получите:
- Client ID: `your-client-id.apps.googleusercontent.com`
- Client Secret: `your-client-secret`

### 6. Настройка переменных окружения

Создайте файл `.env.local` в корне проекта learnus-app:

```env
# NextAuth Configuration
NEXTAUTH_SECRET=your-secret-key-here-use-openssl-rand-base64-32
NEXTAUTH_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# Database
DATABASE_URL=file:./learnus.db
```

### 7. Генерация NEXTAUTH_SECRET

Выполните команду для генерации секретного ключа:

```bash
openssl rand -base64 32
```

### 8. Проверка настройки

1. Запустите приложение: `npm run dev`
2. Перейдите на http://localhost:3000/auth/signin
3. Нажмите "Войти через Google"
4. Авторизуйтесь через свой Google аккаунт
5. Вы должны быть перенаправлены на главную страницу

## Решение возможных проблем

### Ошибка "Access blocked"
- Убедитесь, что OAuth consent screen настроен правильно
- Проверьте, что домены добавлены в Authorized JavaScript origins

### Ошибка "Redirect URI mismatch"
- Проверьте, что redirect URI в Google Console точно совпадает с вашим
- Обратите внимание на http/https и наличие/отсутствие слеша в конце

### Ошибка при входе
- Проверьте логи в консоли браузера и сервера
- Убедитесь, что NEXTAUTH_SECRET установлен
- Проверьте, что база данных инициализирована

## Для продакшена

1. Обновите NEXTAUTH_URL на ваш домен
2. Добавьте продакшен URL в Google Console
3. Используйте HTTPS для безопасности
4. Настройте правильные CORS заголовки