// Роли в чате
export type ChatRole = 'user' | 'assistant' | 'system';

// Типы для сообщений чата
export interface ChatMessage {
  id?: number;
  role: ChatRole;
  content: string;
  created_at?: string;
}

// Типы для API ответов
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  details?: any;
}

export interface ApiError {
  error: string;
  details?: any;
}