import OpenAI from 'openai';
import { ChatMessage } from '@/lib/types';
import { z } from 'zod';

// Схемы валидации
export const SendMessageSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string().min(1),
  })),
});

export type SendMessageData = z.infer<typeof SendMessageSchema>;

// Сократовский промпт
const SOCRATIC_PROMPT = `You are a Socratic tutor. 
Your role is to guide the learner to understanding only through questions, critical reflection, and practical tasks. 
You must never give direct answers, definitions, or lectures. 

Principles you must follow:
1. Use only guiding questions and thought experiments.
2. Apply Socratic questioning techniques:
   - Clarify terms
   - Probe assumptions
   - Examine reasons and evidence
   - Explore alternative views
   - Consider consequences
   - Encourage metacognition
   - Push toward practical application
3. Use Active Recall: ask the learner to restate or retrieve knowledge rather than providing it.
4. Create Desirable Difficulties: reframe questions, introduce counter-examples, or ask for reverse problems.
5. Apply Spaced Retrieval: revisit earlier ideas after some time and check if the learner can still recall them.
6. Interleave practice: mix reasoning, applied exercises, and reflective questions.
7. Keep your output short: 1–2 well-formed questions or tasks per turn.

Your ultimate goal: guide the learner to discover knowledge and skills by themselves, never by telling, always by asking.`;

/**
 * Сервис для работы с чатом и AI
 */
export class ChatService {
  private openai: OpenAI | null = null;
  private chatHistory: ChatMessage[] = [];

  constructor() {
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }
  }

  /**
   * Проверить доступность сервиса
   * @returns boolean
   */
  isAvailable(): boolean {
    return this.openai !== null;
  }

  /**
   * Отправить сообщение в чат
   * @param data - Данные сообщения
   * @returns Promise<string> - Ответ от AI
   * @throws {ValidationError} Если данные некорректны
   * @throws {ServiceUnavailableError} Если OpenAI недоступен
   * @throws {Error} Если ошибка обработки
   */
  async sendMessage(data: SendMessageData): Promise<string> {
    // Валидация данных
    const validatedData = SendMessageSchema.parse(data);

    if (!this.openai) {
      throw new Error('OpenAI API is not configured');
    }

    // Формируем системное сообщение
    const systemMessage = `${SOCRATIC_PROMPT}\n\nПомогай пользователю изучать различные темы через Сократовский метод.`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemMessage },
          ...validatedData.messages,
        ],
      });

      if (!completion.choices[0] || !completion.choices[0].message) {
        throw new Error('Invalid response structure from AI');
      }
      
      const reply = completion.choices[0].message.content;
      if (!reply) {
        throw new Error('Empty response from AI');
      }

      // Сохраняем в локальную историю
      if (validatedData.messages.length > 0) {
        const lastMessage = validatedData.messages[validatedData.messages.length - 1];
        if (lastMessage && lastMessage.content) {
          this.chatHistory.push({
            role: 'user',
            content: lastMessage.content,
            created_at: new Date().toISOString(),
          });
          this.chatHistory.push({
            role: 'assistant',
            content: reply,
            created_at: new Date().toISOString(),
          });
        }
      }

      return reply;
    } catch (error) {
      if (error instanceof OpenAI.APIError) {
        throw new Error(`OpenAI API error: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Получить историю чата
   * @returns Promise<ChatMessage[]>
   */
  async getChatHistory(): Promise<ChatMessage[]> {
    return this.chatHistory;
  }

  /**
   * Очистить историю чата
   * @returns Promise<void>
   */
  async clearChatHistory(): Promise<void> {
    this.chatHistory = [];
  }
}

// Создаем и экспортируем экземпляр сервиса
export const chatService = new ChatService();