import OpenAI from 'openai';
import { ChatMessage } from '@/lib/types';
import { openDb } from '@/lib/db';
import { z } from 'zod';

// Схемы валидации
export const SendMessageSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string().min(1),
  })),
  nodeId: z.number().optional(),
  nodeContent: z.string().optional(),
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

  constructor() {
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }
  }

  /**
   * Проверить доступность OpenAI API
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
    const systemMessage = validatedData.nodeContent
      ? `${SOCRATIC_PROMPT}\n\nТекущая тема обучения: ${validatedData.nodeContent}. Применяй Сократовский метод к этой теме.`
      : `${SOCRATIC_PROMPT}\n\nПомогай пользователю создавать учебные программы и изучать различные темы через Сократовский метод.`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemMessage },
          ...validatedData.messages,
        ],
      });

      const reply = completion.choices[0].message.content;
      if (!reply) {
        throw new Error('Empty response from AI');
      }

      // Сохраняем в историю, если есть nodeId
      if (validatedData.nodeId) {
        await this.saveChatHistory(
          validatedData.nodeId,
          validatedData.messages[validatedData.messages.length - 1].content,
          reply
        );
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
   * Сохранить историю чата
   * @param nodeId - ID узла
   * @param userMessage - Сообщение пользователя
   * @param assistantMessage - Ответ ассистента
   * @private
   */
  private async saveChatHistory(
    nodeId: number,
    userMessage: string,
    assistantMessage: string
  ): Promise<void> {
    const db = await openDb();
    try {
      await db.run(
        'INSERT INTO chat_history (node_id, role, content) VALUES (?, ?, ?)',
        [nodeId, 'user', userMessage]
      );
      await db.run(
        'INSERT INTO chat_history (node_id, role, content) VALUES (?, ?, ?)',
        [nodeId, 'assistant', assistantMessage]
      );
    } catch (error) {
      console.error('Failed to save chat history:', error);
      // Не прерываем основной поток при ошибке сохранения
    } finally {
      await db.close();
    }
  }

  /**
   * Получить историю чата для узла
   * @param nodeId - ID узла
   * @returns Promise<ChatMessage[]>
   * @throws {DatabaseError} Если ошибка БД
   */
  async getChatHistory(nodeId: number): Promise<ChatMessage[]> {
    const db = await openDb();
    try {
      const messages = await db.all<ChatMessage[]>(
        'SELECT * FROM chat_history WHERE node_id = ? ORDER BY created_at',
        [nodeId]
      );
      return messages;
    } finally {
      await db.close();
    }
  }

  /**
   * Очистить историю чата для узла
   * @param nodeId - ID узла
   * @returns Promise<void>
   * @throws {DatabaseError} Если ошибка БД
   */
  async clearChatHistory(nodeId: number): Promise<void> {
    const db = await openDb();
    try {
      await db.run('DELETE FROM chat_history WHERE node_id = ?', [nodeId]);
    } finally {
      await db.close();
    }
  }

  /**
   * Генерировать учебную программу с помощью AI
   * @param topic - Тема для генерации
   * @returns Promise<{title: string, description: string, nodes: Array}>
   * @throws {ServiceUnavailableError} Если OpenAI недоступен
   * @throws {Error} Если ошибка генерации
   */
  async generateProgram(topic: string): Promise<{
    title: string;
    description: string;
    nodes: Array<{ title: string; description: string }>;
  }> {
    if (!this.openai) {
      throw new Error('OpenAI API is not configured');
    }

    const prompt = `Создай структурированную учебную программу для изучения темы: "${topic}".
    
    Программа должна включать:
    1. Название программы
    2. Краткое описание (1-2 предложения)
    3. 5-7 узлов обучения в логической последовательности
    
    Каждый узел должен содержать:
    - Название (краткое, понятное)
    - Описание (что будет изучаться)
    
    Ответ в формате JSON:
    {
      "title": "Название программы",
      "description": "Описание программы",
      "nodes": [
        {"title": "Название узла", "description": "Описание узла"}
      ]
    }`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Ты - эксперт в создании учебных программ. Отвечай только валидным JSON.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
      });

      const response = completion.choices[0].message.content;
      if (!response) {
        throw new Error('Empty response from AI');
      }

      // Парсим JSON ответ
      try {
        const program = JSON.parse(response);
        return program;
      } catch (parseError) {
        throw new Error('Invalid JSON response from AI');
      }
    } catch (error) {
      if (error instanceof OpenAI.APIError) {
        throw new Error(`OpenAI API error: ${error.message}`);
      }
      throw error;
    }
  }
}

// Экспортируем экземпляр сервиса
export const chatService = new ChatService();
