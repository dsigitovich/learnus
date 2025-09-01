import { ProgramNode } from '@/lib/types';
import { openDb } from '@/lib/db';
import { z } from 'zod';

// Схемы валидации
export const CreateNodeSchema = z.object({
  programId: z.number(),
  parentId: z.number().optional(),
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  content: z.string().optional(),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
});

export const UpdateNodeSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  content: z.string().optional(),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }).optional(),
  status: z.enum(['not_started', 'in_progress', 'completed']).optional(),
});

export type CreateNodeData = z.infer<typeof CreateNodeSchema>;
export type UpdateNodeData = z.infer<typeof UpdateNodeSchema>;

/**
 * Сервис для работы с узлами программ
 */
export class NodeService {
  /**
   * Получить узел по ID
   * @param id - ID узла
   * @returns Promise<ProgramNode | null>
   * @throws {DatabaseError} Если ошибка БД
   */
  async getNodeById(id: string): Promise<ProgramNode | null> {
    const db = await openDb();
    try {
      const node = await db.get<ProgramNode>(
        'SELECT * FROM program_nodes WHERE id = ?',
        [id]
      );
      
      if (node && node.position && typeof node.position === 'string') {
        node.position = JSON.parse(node.position);
      }
      
      return node || null;
    } finally {
      await db.close();
    }
  }

  /**
   * Создать новый узел
   * @param data - Данные для создания узла
   * @returns Promise<ProgramNode>
   * @throws {ValidationError} Если данные некорректны
   * @throws {DatabaseError} Если ошибка БД
   */
  async createNode(data: CreateNodeData): Promise<ProgramNode> {
    // Валидация данных
    const validatedData = CreateNodeSchema.parse(data);

    const db = await openDb();
    try {
      // Проверяем существование программы
      const program = await db.get(
        'SELECT id FROM learning_programs WHERE id = ?',
        [validatedData.programId]
      );
      
      if (!program) {
        throw new Error('Program not found');
      }

      // Если указан родитель, проверяем его существование
      if (validatedData.parentId) {
        const parent = await db.get(
          'SELECT id FROM program_nodes WHERE id = ? AND program_id = ?',
          [validatedData.parentId, validatedData.programId]
        );
        
        if (!parent) {
          throw new Error('Parent node not found');
        }
      }

      // Создаем узел
      const result = await db.run(
        `INSERT INTO program_nodes 
         (program_id, parent_id, title, description, content, position, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          validatedData.programId,
          validatedData.parentId || null,
          validatedData.title,
          validatedData.description || null,
          validatedData.content || null,
          JSON.stringify(validatedData.position),
          'not_started'
        ]
      );

      const node = await db.get<ProgramNode>(
        'SELECT * FROM program_nodes WHERE id = ?',
        [result.lastID]
      );

      if (!node) {
        throw new Error('Failed to create node');
      }

      node.position = JSON.parse(node.position as string);
      return node;
    } finally {
      await db.close();
    }
  }

  /**
   * Обновить узел
   * @param id - ID узла
   * @param data - Данные для обновления
   * @returns Promise<ProgramNode>
   * @throws {ValidationError} Если данные некорректны
   * @throws {NotFoundError} Если узел не найден
   * @throws {DatabaseError} Если ошибка БД
   */
  async updateNode(id: string, data: UpdateNodeData): Promise<ProgramNode> {
    // Валидация данных
    const validatedData = UpdateNodeSchema.parse(data);

    const db = await openDb();
    try {
      // Проверяем существование узла
      const existing = await this.getNodeById(id);
      if (!existing) {
        throw new Error('Node not found');
      }

      // Формируем обновления
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

      if (validatedData.content !== undefined) {
        updates.push('content = ?');
        values.push(validatedData.content);
      }

      if (validatedData.position !== undefined) {
        updates.push('position = ?');
        values.push(JSON.stringify(validatedData.position));
      }

      if (validatedData.status !== undefined) {
        updates.push('status = ?');
        values.push(validatedData.status);
      }

      if (updates.length > 0) {
        values.push(id);
        await db.run(
          `UPDATE program_nodes SET ${updates.join(', ')} WHERE id = ?`,
          values
        );
      }

      const updatedNode = await this.getNodeById(id);
      if (!updatedNode) {
        throw new Error('Failed to update node');
      }

      return updatedNode;
    } finally {
      await db.close();
    }
  }

  /**
   * Удалить узел
   * @param id - ID узла
   * @returns Promise<void>
   * @throws {NotFoundError} Если узел не найден
   * @throws {DatabaseError} Если ошибка БД
   */
  async deleteNode(id: string): Promise<void> {
    const db = await openDb();
    try {
      // Проверяем существование узла
      const existing = await this.getNodeById(id);
      if (!existing) {
        throw new Error('Node not found');
      }

      // Удаляем узел (дочерние узлы удалятся каскадно)
      await db.run('DELETE FROM program_nodes WHERE id = ?', [id]);
    } finally {
      await db.close();
    }
  }

  /**
   * Получить дочерние узлы
   * @param parentId - ID родительского узла
   * @returns Promise<ProgramNode[]>
   * @throws {DatabaseError} Если ошибка БД
   */
  async getChildNodes(parentId: number): Promise<ProgramNode[]> {
    const db = await openDb();
    try {
      const nodes = await db.all<ProgramNode[]>(
        'SELECT * FROM program_nodes WHERE parent_id = ? ORDER BY created_at',
        [parentId]
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

  /**
   * Переместить узел
   * @param id - ID узла
   * @param position - Новая позиция
   * @returns Promise<ProgramNode>
   * @throws {NotFoundError} Если узел не найден
   * @throws {DatabaseError} Если ошибка БД
   */
  async moveNode(id: string, position: { x: number; y: number }): Promise<ProgramNode> {
    return this.updateNode(id, { position });
  }

  /**
   * Создать связь между узлами
   * @param parentId - ID родительского узла
   * @param childId - ID дочернего узла
   * @returns Promise<void>
   * @throws {NotFoundError} Если узлы не найдены
   * @throws {DatabaseError} Если ошибка БД
   */
  async linkNodes(parentId: number, childId: number): Promise<void> {
    const db = await openDb();
    try {
      // Проверяем существование обоих узлов
      const parent = await db.get(
        'SELECT id, program_id FROM program_nodes WHERE id = ?',
        [parentId]
      );
      const child = await db.get(
        'SELECT id, program_id FROM program_nodes WHERE id = ?',
        [childId]
      );

      if (!parent || !child) {
        throw new Error('One or both nodes not found');
      }

      if (parent.program_id !== child.program_id) {
        throw new Error('Nodes must belong to the same program');
      }

      // Обновляем parent_id дочернего узла
      await db.run(
        'UPDATE program_nodes SET parent_id = ? WHERE id = ?',
        [parentId, childId]
      );
    } finally {
      await db.close();
    }
  }

  /**
   * Удалить связь между узлами
   * @param childId - ID дочернего узла
   * @returns Promise<void>
   * @throws {NotFoundError} Если узел не найден
   * @throws {DatabaseError} Если ошибка БД
   */
  async unlinkNode(childId: number): Promise<void> {
    const db = await openDb();
    try {
      const child = await db.get(
        'SELECT id FROM program_nodes WHERE id = ?',
        [childId]
      );

      if (!child) {
        throw new Error('Node not found');
      }

      await db.run(
        'UPDATE program_nodes SET parent_id = NULL WHERE id = ?',
        [childId]
      );
    } finally {
      await db.close();
    }
  }
}

// Экспортируем экземпляр сервиса
export const nodeService = new NodeService();
