import { z } from 'zod';

// Общие схемы валидации
export const IdSchema = z.union([z.string(), z.number()]).transform(String);

// Схема для числовых ID
export const NumericIdSchema = z.union([z.string(), z.number()]).transform(Number);

// Схема для строковых ID
export const StringIdSchema = z.union([z.string(), z.number()]).transform(String);

// Схема для параметров API роутов
export const ParamsSchema = z.object({
  id: IdSchema,
});

// Схема для параметров API роутов с числовыми ID
export const NumericParamsSchema = z.object({
  id: NumericIdSchema,
});

// Схема для параметров API роутов со строковыми ID
export const StringParamsSchema = z.object({
  id: StringIdSchema,
});

export const DateSchema = z.string().datetime();

export const PaginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

export const SortSchema = z.object({
  field: z.string(),
  order: z.enum(['asc', 'desc']).default('asc'),
});

// Валидаторы для общих полей
export const TitleSchema = z
  .string()
  .min(1, 'Title is required')
  .max(200, 'Title is too long');

export const DescriptionSchema = z
  .string()
  .max(1000, 'Description is too long')
  .optional();

export const ContentSchema = z
  .string()
  .max(10000, 'Content is too long')
  .optional();

// Схема для позиции узла
export const PositionSchema = z.object({
  x: z.number(),
  y: z.number(),
});

// Схема для статуса
export const NodeStatusSchema = z.enum(['not_started', 'in_progress', 'completed']);

// Схема для роли в чате
export const ChatRoleSchema = z.enum(['user', 'assistant', 'system']);

// Утилиты для валидации
export function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: z.ZodError } {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error };
    }
    throw error;
  }
}

export function validatePartial<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: Partial<T> } | { success: false; errors: z.ZodError } {
  // Проверяем, поддерживает ли схема метод partial
  if ('partial' in schema && typeof schema.partial === 'function') {
    const partialSchema = schema.partial();
    return validateInput(partialSchema, data);
  }
  
  // Если partial не поддерживается, используем обычную валидацию
  return validateInput(schema, data);
}

// Санитизация строк
export function sanitizeString(str: string): string {
  return str.trim().replace(/\s+/g, ' ');
}

export function sanitizeHtml(html: string): string {
  // Простая санитизация HTML (в продакшене использовать DOMPurify)
  return html
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// Валидация email
export const EmailSchema = z
  .string()
  .email('Invalid email format')
  .toLowerCase()
  .transform(sanitizeString);

// Валидация URL
export const UrlSchema = z
  .string()
  .url('Invalid URL format')
  .transform(sanitizeString);

// Валидация пароля
export const PasswordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    'Password must contain uppercase, lowercase, number and special character'
  );

// Проверка безопасности входных данных
export function isSafeInput(input: string): boolean {
  // Проверка на SQL injection паттерны
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|CREATE|ALTER)\b)/i,
    /(--|\/\*|\*\/|;)/,
    /(\bOR\b\s*\d+\s*=\s*\d+)/i,
  ];

  // Проверка на XSS паттерны
  const xssPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /<iframe[^>]*>.*?<\/iframe>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
  ];

  const allPatterns = [...sqlPatterns, ...xssPatterns];
  
  return !allPatterns.some(pattern => pattern.test(input));
}

// Валидация файлов
export const FileSchema = z.object({
  name: z.string(),
  size: z.number().max(10 * 1024 * 1024, 'File size must be less than 10MB'),
  type: z.string(),
});

export const ImageFileSchema = FileSchema.extend({
  type: z.string().regex(/^image\/(jpeg|jpg|png|gif|webp)$/, 'Invalid image type'),
});

// Утилита для создания безопасных ID
export function generateId(prefix?: string): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 9);
  return prefix ? `${prefix}_${timestamp}${random}` : `${timestamp}${random}`;
}

// Утилита для валидации и парсинга JSON
export function parseJSON<T>(
  json: string,
  schema?: z.ZodSchema<T>
): { success: true; data: T } | { success: false; error: string } {
  try {
    const parsed = JSON.parse(json);
    if (schema) {
      const validated = schema.parse(parsed);
      return { success: true, data: validated };
    }
    return { success: true, data: parsed };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Invalid JSON',
    };
  }
}
