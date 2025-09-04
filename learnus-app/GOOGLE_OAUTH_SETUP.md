# Настройка Google OAuth для Learnus

## Шаги для настройки Google OAuth:

### 1. Создание проекта в Google Cloud Console

1. Перейдите в [Google Cloud Console](https://console.cloud.google.com/)
2. Создайте новый проект или выберите существующий
3. Включите Google+ API (если еще не включен)

### 2. Настройка OAuth consent screen

1. В левом меню выберите "APIs & Services" > "OAuth consent screen"
2. Выберите "External" (для тестирования) или "Internal" (для корпоративных аккаунтов)
3. Заполните обязательные поля:
   - App name: "Learnus"
   - User support email: ваш email
   - Developer contact information: ваш email
4. Нажмите "Save and Continue"
5. На шаге "Scopes" нажмите "Add or Remove Scopes" и добавьте:
   - `../auth/userinfo.email`
   - `../auth/userinfo.profile`
6. Нажмите "Save and Continue"
7. На шаге "Test users" добавьте email адреса для тестирования (если выбрали External)
8. Нажмите "Save and Continue"

### 3. Создание OAuth 2.0 credentials

1. В левом меню выберите "APIs & Services" > "Credentials"
2. Нажмите "Create Credentials" > "OAuth 2.0 Client IDs"
3. Выберите "Web application"
4. Заполните поля:
   - Name: "Learnus Web Client"
   - Authorized JavaScript origins: `http://localhost:3000`
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
5. Нажмите "Create"
6. Скопируйте Client ID и Client Secret

### 4. Настройка переменных окружения

Создайте файл `.env.local` в корне проекта со следующим содержимым:

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-change-in-production

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here

# OpenAI Configuration (опционально)
OPENAI_API_KEY=your-openai-api-key-here
```

### 5. Генерация NEXTAUTH_SECRET

Вы можете сгенерировать секретный ключ с помощью команды:

```bash
openssl rand -base64 32
```

Или использовать онлайн генератор: https://generate-secret.vercel.app/32

### 6. Перезапуск приложения

После настройки переменных окружения перезапустите приложение:

```bash
npm run dev
```

### 7. Тестирование

1. Откройте http://localhost:3000
2. Нажмите "Войти через Google"
3. Выберите Google аккаунт
4. Разрешите доступ приложению
5. Вы должны быть перенаправлены обратно в приложение

## Возможные проблемы:

### Ошибка "redirect_uri_mismatch"
- Убедитесь, что в Google Console добавлен правильный redirect URI: `http://localhost:3000/api/auth/callback/google`

### Ошибка "access_denied"
- Проверьте, что OAuth consent screen настроен правильно
- Убедитесь, что ваш email добавлен в список тестовых пользователей (если используется External тип)

### Ошибка "invalid_client"
- Проверьте правильность GOOGLE_CLIENT_ID и GOOGLE_CLIENT_SECRET в .env.local

## Для продакшена:

1. Измените NEXTAUTH_URL на ваш домен
2. Обновите Authorized JavaScript origins и redirect URIs в Google Console
3. Опубликуйте OAuth consent screen (если используете External тип)
4. Используйте HTTPS для всех URL
