import { LearningProgress, ProgramNode } from '@/lib/types';
import { openDb } from '@/lib/db';
import { z } from 'zod';

// Схемы валидации
export const UpdateProgressSchema = z.object({
  nodeId: z.number(),
  status: z.enum(['not_started', 'in_progress', 'completed']),
  notes: z.string().optional(),
});

export type UpdateProgressData = z.infer<typeof UpdateProgressSchema>;

/**
 * Сервис для работы с прогрессом обучения
 */
export class ProgressService {
  /**
   * Получить прогресс для всех узлов программы
   * @param programId - ID программы
   * @returns Promise<Map<number, LearningProgress>>
   * @throws {DatabaseError} Если ошибка БД
   */
  async getProgramProgress(programId: number): Promise<Map<number, LearningProgress>> {
    const db = await openDb();
    try {
      const progress = await db.all<LearningProgress[]>(
        `SELECT lp.* FROM learning_progress lp
         JOIN program_nodes pn ON pn.id = lp.node_id
         WHERE pn.program_id = ?`,
        [programId]
      );

      // Возвращаем как Map для удобства доступа
      const progressMap = new Map<number, LearningProgress>();
      progress.forEach(p => {
        progressMap.set(p.node_id, p);
      });

      return progressMap;
    } finally {
      await db.close();
    }
  }

  /**
   * Получить прогресс для конкретного узла
   * @param nodeId - ID узла
   * @returns Promise<LearningProgress | null>
   * @throws {DatabaseError} Если ошибка БД
   */
  async getNodeProgress(nodeId: number): Promise<LearningProgress | null> {
    const db = await openDb();
    try {
      const progress = await db.get<LearningProgress>(
        'SELECT * FROM learning_progress WHERE node_id = ?',
        [nodeId]
      );
      return progress || null;
    } finally {
      await db.close();
    }
  }

  /**
   * Обновить прогресс узла
   * @param data - Данные для обновления прогресса
   * @returns Promise<LearningProgress>
   * @throws {ValidationError} Если данные некорректны
   * @throws {DatabaseError} Если ошибка БД
   */
  async updateProgress(data: UpdateProgressData): Promise<LearningProgress> {
    // Валидация данных
    const validatedData = UpdateProgressSchema.parse(data);

    const db = await openDb();
    try {
      // Проверяем существование узла
      const node = await db.get(
        'SELECT id FROM program_nodes WHERE id = ?',
        [validatedData.nodeId]
      );
      
      if (!node) {
        throw new Error('Node not found');
      }

      // Определяем completed_at
      const completedAt = validatedData.status === 'completed' 
        ? new Date().toISOString() 
        : null;

      // Upsert прогресса
      await db.run(
        `INSERT OR REPLACE INTO learning_progress 
         (node_id, status, completed_at, notes) 
         VALUES (?, ?, ?, ?)`,
        [
          validatedData.nodeId,
          validatedData.status,
          completedAt,
          validatedData.notes || null
        ]
      );

      const progress = await this.getNodeProgress(validatedData.nodeId);
      if (!progress) {
        throw new Error('Failed to update progress');
      }

      return progress;
    } finally {
      await db.close();
    }
  }

  /**
   * Сбросить прогресс для программы
   * @param programId - ID программы
   * @returns Promise<void>
   * @throws {DatabaseError} Если ошибка БД
   */
  async resetProgramProgress(programId: number): Promise<void> {
    const db = await openDb();
    try {
      await db.run(
        `DELETE FROM learning_progress 
         WHERE node_id IN (
           SELECT id FROM program_nodes WHERE program_id = ?
         )`,
        [programId]
      );
    } finally {
      await db.close();
    }
  }

  /**
   * Получить статистику прогресса программы
   * @param programId - ID программы
   * @returns Promise<{total: number, completed: number, inProgress: number, notStarted: number}>
   * @throws {DatabaseError} Если ошибка БД
   */
  async getProgramStats(programId: number): Promise<{
    total: number;
    completed: number;
    inProgress: number;
    notStarted: number;
    completionPercentage: number;
  }> {
    const db = await openDb();
    try {
      // Получаем общее количество узлов
      const totalResult = await db.get<{ count: number }>(
        'SELECT COUNT(*) as count FROM program_nodes WHERE program_id = ?',
        [programId]
      );
      const total = totalResult?.count || 0;

      // Получаем статистику по статусам
      const stats = await db.all<{ status: string; count: number }[]>(
        `SELECT lp.status, COUNT(*) as count 
         FROM program_nodes pn
         LEFT JOIN learning_progress lp ON pn.id = lp.node_id
         WHERE pn.program_id = ?
         GROUP BY lp.status`,
        [programId]
      );

      // Обрабатываем результаты
      let completed = 0;
      let inProgress = 0;
      let notStarted = 0;

      stats.forEach(stat => {
        if (stat.status === 'completed') {
          completed = stat.count;
        } else if (stat.status === 'in_progress') {
          inProgress = stat.count;
        } else if (stat.status === 'not_started' || stat.status === null) {
          notStarted += stat.count;
        }
      });

      // Узлы без записей в learning_progress считаются not_started
      const withProgress = completed + inProgress + notStarted;
      if (withProgress < total) {
        notStarted += total - withProgress;
      }

      const completionPercentage = total > 0 
        ? Math.round((completed / total) * 100) 
        : 0;

      return {
        total,
        completed,
        inProgress,
        notStarted,
        completionPercentage,
      };
    } finally {
      await db.close();
    }
  }

  /**
   * Получить следующий узел для изучения
   * @param programId - ID программы
   * @returns Promise<ProgramNode | null>
   * @throws {DatabaseError} Если ошибка БД
   */
  async getNextNode(programId: number): Promise<ProgramNode | null> {
    const db = await openDb();
    try {
      // Ищем первый узел, который не завершен
      const node = await db.get<ProgramNode>(
        `SELECT pn.* FROM program_nodes pn
         LEFT JOIN learning_progress lp ON pn.id = lp.node_id
         WHERE pn.program_id = ? 
         AND (lp.status IS NULL OR lp.status != 'completed')
         ORDER BY pn.created_at
         LIMIT 1`,
        [programId]
      );

      if (node && node.position && typeof node.position === 'string') {
        node.position = JSON.parse(node.position);
      }

      return node || null;
    } finally {
      await db.close();
    }
  }
}

// Экспортируем экземпляр сервиса
export const progressService = new ProgressService();
