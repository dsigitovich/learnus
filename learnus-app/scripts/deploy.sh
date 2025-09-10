#!/bin/bash

# Скрипт для деплоя LearnUs приложения
set -e

echo "🚀 Starting LearnUs deployment..."

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Функция для логирования
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

warn() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

# Проверяем наличие необходимых переменных окружения
check_env() {
    log "Checking environment variables..."
    
    required_vars=(
        "NEXTAUTH_SECRET"
        "GOOGLE_CLIENT_ID"
        "GOOGLE_CLIENT_SECRET"
        "OPENAI_API_KEY"
    )
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            error "Environment variable $var is not set"
        fi
    done
    
    log "All required environment variables are set"
}

# Сборка приложения
build_app() {
    log "Building application..."
    
    # Устанавливаем зависимости
    npm ci --only=production
    
    # Запускаем линтинг
    log "Running linter..."
    npm run lint
    
    # Проверяем типы
    log "Running type check..."
    npm run type-check
    
    # Запускаем тесты
    log "Running tests..."
    npm run test:coverage
    
    # Собираем приложение
    log "Building Next.js application..."
    npm run build
    
    log "Application built successfully"
}

# Инициализация базы данных
init_database() {
    log "Initializing database..."
    
    if [ -f "scripts/init-db-production.js" ]; then
        node scripts/init-db-production.js
    else
        node scripts/init-db.js
    fi
    
    log "Database initialized successfully"
}

# Сборка Docker образа
build_docker() {
    log "Building Docker image..."
    
    # Проверяем наличие Dockerfile
    if [ ! -f "Dockerfile" ]; then
        error "Dockerfile not found"
    fi
    
    # Собираем образ
    docker build -t learnus:latest .
    
    log "Docker image built successfully"
}

# Запуск приложения
start_app() {
    log "Starting application..."
    
    # Проверяем, запущен ли уже контейнер
    if docker ps -q -f name=learnus-app | grep -q .; then
        log "Stopping existing container..."
        docker stop learnus-app
        docker rm learnus-app
    fi
    
    # Запускаем новый контейнер
    docker run -d \
        --name learnus-app \
        --restart unless-stopped \
        -p 3000:3000 \
        -e NODE_ENV=production \
        -e NEXTAUTH_URL="${NEXTAUTH_URL:-http://localhost:3000}" \
        -e NEXTAUTH_SECRET="$NEXTAUTH_SECRET" \
        -e GOOGLE_CLIENT_ID="$GOOGLE_CLIENT_ID" \
        -e GOOGLE_CLIENT_SECRET="$GOOGLE_CLIENT_SECRET" \
        -e OPENAI_API_KEY="$OPENAI_API_KEY" \
        -v "$(pwd)/learnus.db:/app/learnus.db" \
        -v "$(pwd)/logs:/app/logs" \
        learnus:latest
    
    log "Application started successfully"
}

# Проверка здоровья приложения
health_check() {
    log "Performing health check..."
    
    # Ждем запуска приложения
    sleep 10
    
    # Проверяем health endpoint
    for i in {1..30}; do
        if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
            log "Health check passed"
            return 0
        fi
        echo "Waiting for application to start... ($i/30)"
        sleep 2
    done
    
    error "Health check failed - application is not responding"
}

# Основная функция
main() {
    log "LearnUs Deployment Script"
    log "========================"
    
    # Проверяем аргументы
    case "${1:-all}" in
        "env")
            check_env
            ;;
        "build")
            check_env
            build_app
            ;;
        "docker")
            build_docker
            ;;
        "deploy")
            check_env
            build_app
            init_database
            build_docker
            start_app
            health_check
            ;;
        "all")
            check_env
            build_app
            init_database
            build_docker
            start_app
            health_check
            ;;
        *)
            echo "Usage: $0 {env|build|docker|deploy|all}"
            echo "  env    - Check environment variables"
            echo "  build  - Build application"
            echo "  docker - Build Docker image"
            echo "  deploy - Full deployment"
            echo "  all    - Full deployment (default)"
            exit 1
            ;;
    esac
    
    log "Deployment completed successfully! 🎉"
    log "Application is available at: http://localhost:3000"
}

# Запускаем основную функцию
main "$@"
