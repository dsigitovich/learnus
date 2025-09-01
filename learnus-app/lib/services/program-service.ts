import { LearningProgram, ProgramNode } from '@/lib/types';
import { openDb } from '@/lib/db';
import { z } from 'zod';

// Схемы валидации
export const CreateProgramSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().optional(),
});

export const UpdateProgramSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
});

export type CreateProgramData = z.infer<typeof CreateProgramSchema>;
export type UpdateProgramData = z.infer<typeof UpdateProgramSchema>;

/**
 * Сервис для работы с учебными программами
 */
export class ProgramService {
  /**
   * Получить все программы
   * @returns Promise<LearningProgram[]>
   * @throws {DatabaseError} Если ошибка БД
   */
  async getAllPrograms(): Promise<LearningProgram[]> {
    const db = await openDb();
    try {
      const programs = await db.all<LearningProgram[]>(
        'SELECT * FROM learning_programs ORDER BY created_at DESC'
      );
      return programs;
    } finally {
      await db.close();
    }
  }

  /**
   * Получить программу по ID
   * @param id - ID программы
   * @returns Promise<LearningProgram | null>
   * @throws {DatabaseError} Если ошибка БД
   */
  async getProgramById(id: number): Promise<LearningProgram | null> {
    const db = await openDb();
    try {
      const program = await db.get<LearningProgram>(
        'SELECT * FROM learning_programs WHERE id = ?',
        [id]
      );
      return program || null;
    } finally {
      await db.close();
    }
  }

  /**
   * Создать новую программу
   * @param data - Данные для создания программы
   * @returns Promise<LearningProgram>
   * @throws {ValidationError} Если данные некорректны
   * @throws {DatabaseError} Если ошибка БД
   */
  async createProgram(data: CreateProgramData): Promise<LearningProgram> {
    // Валидация данных
    const validatedData = CreateProgramSchema.parse(data);

    const db = await openDb();
    try {
      const result = await db.run(
        'INSERT INTO learning_programs (title, description) VALUES (?, ?)',
        [validatedData.title, validatedData.description || null]
      );

      const program = await db.get<LearningProgram>(
        'SELECT * FROM learning_programs WHERE id = ?',
        [result.lastID]
      );

      if (!program) {
        throw new Error('Failed to create program');
      }

      return program;
    } finally {
      await db.close();
    }
  }

  /**
   * Обновить программу
   * @param id - ID программы
   * @param data - Данные для обновления
   * @returns Promise<LearningProgram>
   * @throws {ValidationError} Если данные некорректны
   * @throws {NotFoundError} Если программа не найдена
   * @throws {DatabaseError} Если ошибка БД
   */
  async updateProgram(id: number, data: UpdateProgramData): Promise<LearningProgram> {
    // Валидация данных
    const validatedData = UpdateProgramSchema.parse(data);

    const db = await openDb();
    try {
      // Проверяем существование программы
      const existing = await this.getProgramById(id);
      if (!existing) {
        throw new Error('Program not found');
      }

      // Обновляем только переданные поля
      const updates: string[] = [];
      const values: any[] = [];

      if (validatedData.title !== undefined) {
        updates.push('title = ?');
        values.push(validatedData.title);
      }

      if (validatedData.description !== undefined) {
        updates.push('description = ?');
        values.push(validatedData.description);
      }

      if (updates.length > 0) {
        updates.push('updated_at = CURRENT_TIMESTAMP');
        values.push(id);

        await db.run(
          `UPDATE learning_programs SET ${updates.join(', ')} WHERE id = ?`,
          values
        );
      }

      const updatedProgram = await this.getProgramById(id);
      if (!updatedProgram) {
        throw new Error('Failed to update program');
      }

      return updatedProgram;
    } finally {
      await db.close();
    }
  }

  /**
   * Удалить программу
   * @param id - ID программы
   * @returns Promise<void>
   * @throws {NotFoundError} Если программа не найдена
   * @throws {DatabaseError} Если ошибка БД
   */
  async deleteProgram(id: number): Promise<void> {
    const db = await openDb();
    try {
      // Проверяем существование программы
      const existing = await this.getProgramById(id);
      if (!existing) {
        throw new Error('Program not found');
      }

      // Удаляем программу (узлы удалятся каскадно)
      await db.run('DELETE FROM learning_programs WHERE id = ?', [id]);
    } finally {
      await db.close();
    }
  }

  /**
   * Получить узлы программы
   * @param programId - ID программы
   * @returns Promise<ProgramNode[]>
   * @throws {DatabaseError} Если ошибка БД
   */
  async getProgramNodes(programId: number): Promise<ProgramNode[]> {
    const db = await openDb();
    try {
      const nodes = await db.all<ProgramNode[]>(
        'SELECT * FROM program_nodes WHERE program_id = ? ORDER BY created_at',
        [programId]
      );
      
      // Парсим позиции из JSON
      return nodes.map(node => ({
        ...node,
        position: typeof node.position === 'string' ? 
          JSON.parse(node.position) : node.position
      }));
    } finally {
      await db.close();
    }
  }
}

// Экспортируем экземпляр сервиса
export const programService = new ProgramService();