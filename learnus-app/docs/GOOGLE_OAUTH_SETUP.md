# Настройка Google OAuth для LearnUs

## Шаги для настройки Google OAuth

### 1. Создание проекта в Google Cloud Console

1. Перейдите на [Google Cloud Console](https://console.cloud.google.com/)
2. Создайте новый проект или выберите существующий
3. Запомните Project ID

### 2. Включение Google+ API

1. В боковом меню выберите "APIs & Services" → "Library"
2. Найдите "Google+ API" или "Google Identity"
3. Нажмите "Enable"

### 3. Создание OAuth 2.0 учетных данных

1. Перейдите в "APIs & Services" → "Credentials"
2. Нажмите "Create Credentials" → "OAuth client ID"
3. Если требуется, настройте OAuth consent screen:
   - User Type: External
   - App name: LearnUs
   - User support email: ваш email
   - Developer contact: ваш email
   - Scopes: email, profile, openid

### 4. Настройка OAuth Client

1. Application type: Web application
2. Name: LearnUs Web Client
3. Authorized JavaScript origins:
   - http://localhost:3000 (для разработки)
   - https://yourdomain.com (для продакшена)
4. Authorized redirect URIs:
   - http://localhost:3000/api/auth/callback/google (для разработки)
   - https://yourdomain.com/api/auth/callback/google (для продакшена)

### 5. Получение учетных данных

После создания вы получите:
- Client ID
- Client Secret

### 6. Настройка переменных окружения

Обновите файл `.env.local`:

```env
# NextAuth.js Configuration
NEXTAUTH_SECRET=your-secret-key-here # Сгенерируйте с помощью: openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here

# Database
DATABASE_URL=file:./learnus.db
```

### 7. Генерация NEXTAUTH_SECRET

Выполните в терминале:
```bash
openssl rand -base64 32
```

Скопируйте результат и вставьте в `NEXTAUTH_SECRET`.

## Проверка работы

1. Запустите приложение:
   ```bash
   npm run dev
   ```

2. Перейдите на http://localhost:3000

3. Вы должны быть перенаправлены на страницу входа

4. Нажмите "Войти через Google"

5. После успешного входа вы будете перенаправлены на главную страницу

## Возможные проблемы

### Ошибка "redirect_uri_mismatch"
- Убедитесь, что redirect URI в Google Console точно совпадает с вашим URL
- Проверьте, что используете правильный протокол (http/https)

### Ошибка "Access blocked"
- Убедитесь, что приложение опубликовано (не в режиме тестирования)
- Или добавьте тестовых пользователей в OAuth consent screen

### База данных не создается
- Убедитесь, что выполнили скрипт инициализации:
  ```bash
  npx tsx scripts/init-auth-db.ts
  ```

## Безопасность

1. **Никогда** не коммитьте файл `.env.local` в git
2. Используйте разные учетные данные для разработки и продакшена
3. Регулярно обновляйте `NEXTAUTH_SECRET`
4. Ограничьте домены в Authorized JavaScript origins