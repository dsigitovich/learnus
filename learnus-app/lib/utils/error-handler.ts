import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

// Классы кастомных ошибок
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public details?: any) {
    super(400, message);
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(404, `${resource} not found`);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(401, message);
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(403, message);
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(409, message);
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(service: string) {
    super(503, `${service} service is unavailable`);
    Object.setPrototypeOf(this, ServiceUnavailableError.prototype);
  }
}

export class DatabaseError extends AppError {
  constructor(message = 'Database operation failed') {
    super(500, message, false);
    Object.setPrototypeOf(this, DatabaseError.prototype);
  }
}

// Обработчик ошибок для API routes
export function handleApiError(error: unknown): NextResponse {
  console.error('API Error:', error);

  // Обработка ZodError
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: 'Validation failed',
        details: error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      },
      { status: 400 }
    );
  }

  // Обработка кастомных ошибок
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: error.message,
        ...(error instanceof ValidationError && error.details
          ? { details: error.details }
          : {}),
      },
      { status: error.statusCode }
    );
  }

  // Обработка стандартных ошибок
  if (error instanceof Error) {
    // В продакшене не показываем детали внутренних ошибок
    const message =
      process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : error.message;

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }

  // Неизвестная ошибка
  return NextResponse.json(
    { error: 'An unexpected error occurred' },
    { status: 500 }
  );
}

// Обработчик ошибок для клиентской части
export function handleClientError(error: unknown): {
  message: string;
  details?: any;
} {
  console.error('Client Error:', error);

  if (error instanceof AppError) {
    return {
      message: error.message,
      ...(error instanceof ValidationError && error.details
        ? { details: error.details }
        : {}),
    };
  }

  if (error instanceof Error) {
    return { message: error.message };
  }

  return { message: 'An unexpected error occurred' };
}

// Декоратор для обработки ошибок в асинхронных функциях
export function withErrorHandler<T extends (...args: any[]) => Promise<any>>(
  fn: T
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      throw handleClientError(error);
    }
  }) as T;
}

// Логирование ошибок
export function logError(error: unknown, context?: Record<string, any>): void {
  const timestamp = new Date().toISOString();
  const errorInfo = {
    timestamp,
    context,
    error:
      error instanceof Error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : error,
  };

  // В продакшене отправляем в систему мониторинга
  if (process.env.NODE_ENV === 'production') {
    // TODO: Интеграция с Sentry или другой системой мониторинга
    console.error(JSON.stringify(errorInfo));
  } else {
    console.error('Error Log:', errorInfo);
  }
}