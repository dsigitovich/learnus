# 🚀 LearnUs Deployment Guide

Этот документ описывает процесс деплоя приложения LearnUs.

## 📋 Предварительные требования

### Системные требования
- Node.js 20+
- Docker и Docker Compose
- Git
- SSL сертификаты (для продакшена)

### Переменные окружения
Создайте файл `.env.local` на основе `env.example`:

```bash
cp env.example .env.local
```

Заполните следующие переменные:

```env
# NextAuth Configuration
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-super-secret-key-here

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# OpenAI API
OPENAI_API_KEY=your-openai-api-key

# Database
DATABASE_URL=file:./learnus.db

# Application
NODE_ENV=production
PORT=3000
```

## 🐳 Docker Deployment

### Быстрый старт

1. **Клонируйте репозиторий:**
```bash
git clone <repository-url>
cd learnus-app
```

2. **Настройте переменные окружения:**
```bash
cp env.example .env.local
# Отредактируйте .env.local с вашими значениями
```

3. **Запустите деплой:**
```bash
./scripts/deploy.sh
```

### Ручная сборка и запуск

1. **Сборка Docker образа:**
```bash
docker build -t learnus:latest .
```

2. **Запуск контейнера:**
```bash
docker run -d \
  --name learnus-app \
  --restart unless-stopped \
  -p 3000:3000 \
  --env-file .env.local \
  -v $(pwd)/learnus.db:/app/learnus.db \
  learnus:latest
```

### Docker Compose

Для запуска с Nginx reverse proxy:

```bash
docker-compose --profile production up -d
```

## 🔧 Локальная разработка

### Установка зависимостей
```bash
npm install
```

### Инициализация базы данных
```bash
npm run db:init
```

### Запуск в режиме разработки
```bash
npm run dev
```

### Запуск тестов
```bash
npm test
npm run test:coverage
```

## 🌐 Production Deployment

### VPS/Cloud Server

1. **Подготовка сервера:**
```bash
# Установка Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Установка Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

2. **Клонирование и настройка:**
```bash
git clone <repository-url>
cd learnus-app
cp env.example .env.local
# Настройте переменные окружения
```

3. **SSL сертификаты (Let's Encrypt):**
```bash
# Установка Certbot
sudo apt install certbot

# Получение сертификата
sudo certbot certonly --standalone -d your-domain.com

# Копирование сертификатов
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ssl/key.pem
```

4. **Запуск приложения:**
```bash
./scripts/deploy.sh
```

### Cloud Platforms

#### Vercel
```bash
npm install -g vercel
vercel --prod
```

#### Railway
```bash
# Подключите GitHub репозиторий к Railway
# Настройте переменные окружения в панели Railway
```

#### DigitalOcean App Platform
```bash
# Создайте app.yaml файл
# Подключите GitHub репозиторий
```

## 🔍 Мониторинг и логи

### Health Check
Приложение предоставляет health check endpoint:
```
GET /api/health
```

### Логи
```bash
# Docker логи
docker logs learnus-app

# Nginx логи
docker logs nginx
```

### Мониторинг
- Используйте `docker stats` для мониторинга ресурсов
- Настройте алерты для health check endpoint
- Мониторьте логи на предмет ошибок

## 🔄 CI/CD с GitHub Actions

GitHub Actions автоматически:
- Запускает тесты при каждом PR
- Собирает Docker образ при push в main
- Деплоит в продакшен (настройте secrets)

### Необходимые Secrets:
- `DOCKER_USERNAME` - Docker Hub username
- `DOCKER_PASSWORD` - Docker Hub password
- `NEXTAUTH_SECRET` - NextAuth secret
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `OPENAI_API_KEY` - OpenAI API key

## 🛠️ Troubleshooting

### Проблемы с базой данных
```bash
# Проверка базы данных
sqlite3 learnus.db ".tables"

# Пересоздание базы данных
rm learnus.db
npm run db:init
```

### Проблемы с Docker
```bash
# Очистка Docker
docker system prune -a

# Пересборка образа
docker build --no-cache -t learnus:latest .
```

### Проблемы с портами
```bash
# Проверка занятых портов
netstat -tulpn | grep :3000

# Остановка контейнера
docker stop learnus-app
docker rm learnus-app
```

## 📊 Performance Optimization

### Database
- Используйте WAL режим для SQLite
- Регулярно делайте VACUUM
- Настройте индексы

### Application
- Включите gzip сжатие в Nginx
- Используйте CDN для статических файлов
- Настройте кэширование

### Monitoring
- Настройте мониторинг ресурсов
- Используйте APM инструменты
- Настройте алерты

## 🔐 Security

### Рекомендации
- Используйте HTTPS в продакшене
- Регулярно обновляйте зависимости
- Настройте firewall
- Используйте сильные пароли для переменных окружения
- Включите security headers в Nginx

### Backup
```bash
# Backup базы данных
cp learnus.db backup/learnus-$(date +%Y%m%d).db

# Backup с Docker
docker exec learnus-app sqlite3 /app/learnus.db ".backup /app/backup.db"
```

## 📞 Поддержка

При возникновении проблем:
1. Проверьте логи приложения
2. Убедитесь, что все переменные окружения настроены
3. Проверьте health check endpoint
4. Создайте issue в репозитории

---

**Удачного деплоя! 🚀**
