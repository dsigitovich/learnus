import { injectable } from 'inversify';
import { ICourseProgressRepository } from '@domain/repositories/ICourseProgressRepository';
import { CourseProgress } from '@domain/entities/CourseProgress';
import { Result } from '@shared/types/result';
import { DatabaseService } from './Database';
import { TYPES } from '@shared/container/types';
import { inject } from 'inversify';

@injectable()
export class CourseProgressRepository implements ICourseProgressRepository {
  constructor(
    @inject(TYPES.Database) private databaseService: DatabaseService
  ) {
    this.initializeTables();
  }

  private initializeTables(): void {
    const db = this.databaseService.getDatabase();
    
    // Создаем таблицу для прогресса курсов
    db.exec(`
      CREATE TABLE IF NOT EXISTS course_progress (
        id TEXT PRIMARY KEY,
        course_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        started_at TEXT,
        completed_at TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        UNIQUE(course_id, user_id)
      )
    `);

    // Создаем таблицу для прогресса уроков
    db.exec(`
      CREATE TABLE IF NOT EXISTS lesson_progress (
        id TEXT PRIMARY KEY,
        course_progress_id TEXT NOT NULL,
        lesson_id TEXT NOT NULL,
        status TEXT NOT NULL,
        started_at TEXT,
        completed_at TEXT,
        duration_in_minutes INTEGER,
        notes TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (course_progress_id) REFERENCES course_progress (id) ON DELETE CASCADE
      )
    `);
  }

  async save(courseProgress: CourseProgress): Promise<Result<void, Error>> {
    try {
      const db = this.databaseService.getDatabase();
      const now = new Date().toISOString();

      // Начинаем транзакцию
      const transaction = db.transaction(() => {
        // Сохраняем основной прогресс курса
        const stmt = db.prepare(`
          INSERT OR REPLACE INTO course_progress 
          (id, course_id, user_id, started_at, completed_at, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        
        stmt.run(
          courseProgress.id,
          courseProgress.courseId,
          courseProgress.userId,
          courseProgress.startedAt?.toISOString() || null,
          courseProgress.completedAt?.toISOString() || null,
          now,
          now
        );

        // Удаляем старые прогрессы уроков
        const deleteStmt = db.prepare('DELETE FROM lesson_progress WHERE course_progress_id = ?');
        deleteStmt.run(courseProgress.id);

        // Сохраняем прогрессы уроков
        const lessonStmt = db.prepare(`
          INSERT INTO lesson_progress 
          (id, course_progress_id, lesson_id, status, started_at, completed_at, duration_in_minutes, notes, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        for (const lessonProgress of courseProgress.lessonProgresses) {
          lessonStmt.run(
            lessonProgress.id,
            courseProgress.id,
            lessonProgress.lessonId,
            lessonProgress.status.toString(),
            lessonProgress.startedAt?.toISOString() || null,
            lessonProgress.completedAt?.toISOString() || null,
            lessonProgress.getDurationInMinutes(),
            lessonProgress.notes || null,
            now,
            now
          );
        }
      });

      transaction();
      return Result.ok<void>();
    } catch (error) {
      return Result.fail(new Error(`Failed to save course progress: ${(error as Error).message}`));
    }
  }

  async findById(id: string): Promise<Result<CourseProgress | null, Error>> {
    try {
      const db = this.databaseService.getDatabase();
      
      const courseProgressStmt = db.prepare(`
        SELECT * FROM course_progress WHERE id = ?
      `);
      
      const courseProgressRow = courseProgressStmt.get(id) as any;
      if (!courseProgressRow) {
        return Result.ok(null);
      }

      const lessonProgressStmt = db.prepare(`
        SELECT * FROM lesson_progress WHERE course_progress_id = ?
      `);
      
      const lessonProgressRows = lessonProgressStmt.all(id) as any[];

      // Создаем объект CourseProgress из данных базы
      const courseProgress = this.mapRowToCourseProgress(courseProgressRow, lessonProgressRows);
      return Result.ok(courseProgress);
    } catch (error) {
      return Result.fail(new Error(`Failed to find course progress: ${(error as Error).message}`));
    }
  }

  async findByCourseIdAndUserId(courseId: string, userId: string): Promise<Result<CourseProgress | null, Error>> {
    try {
      const db = this.databaseService.getDatabase();
      
      const courseProgressStmt = db.prepare(`
        SELECT * FROM course_progress WHERE course_id = ? AND user_id = ?
      `);
      
      const courseProgressRow = courseProgressStmt.get(courseId, userId) as any;
      if (!courseProgressRow) {
        return Result.ok(null);
      }

      const lessonProgressStmt = db.prepare(`
        SELECT * FROM lesson_progress WHERE course_progress_id = ?
      `);
      
      const lessonProgressRows = lessonProgressStmt.all(courseProgressRow.id) as any[];

      // Создаем объект CourseProgress из данных базы
      const courseProgress = this.mapRowToCourseProgress(courseProgressRow, lessonProgressRows);
      return Result.ok(courseProgress);
    } catch (error) {
      return Result.fail(new Error(`Failed to find course progress: ${(error as Error).message}`));
    }
  }

  async findByUserId(userId: string): Promise<Result<CourseProgress[], Error>> {
    try {
      const db = this.databaseService.getDatabase();
      
      const courseProgressStmt = db.prepare(`
        SELECT * FROM course_progress WHERE user_id = ?
      `);
      
      const courseProgressRows = courseProgressStmt.all(userId) as any[];
      const courseProgresses: CourseProgress[] = [];

      for (const row of courseProgressRows) {
        const lessonProgressStmt = db.prepare(`
          SELECT * FROM lesson_progress WHERE course_progress_id = ?
        `);
        
        const lessonProgressRows = lessonProgressStmt.all(row.id) as any[];
        const courseProgress = this.mapRowToCourseProgress(row, lessonProgressRows);
        courseProgresses.push(courseProgress);
      }

      return Result.ok(courseProgresses);
    } catch (error) {
      return Result.fail(new Error(`Failed to find course progress: ${(error as Error).message}`));
    }
  }

  async delete(id: string): Promise<Result<void, Error>> {
    try {
      const db = this.databaseService.getDatabase();
      
      const stmt = db.prepare('DELETE FROM course_progress WHERE id = ?');
      stmt.run(id);
      
      return Result.ok<void>();
    } catch (error) {
      return Result.fail(new Error(`Failed to delete course progress: ${(error as Error).message}`));
    }
  }

  private mapRowToCourseProgress(courseProgressRow: any, lessonProgressRows: any[]): CourseProgress {
    // Импортируем необходимые классы
    const { CourseProgress } = require('@domain/entities/CourseProgress');
    const { LessonProgress } = require('@domain/entities/LessonProgress');
    const { ProgressStatus } = require('@domain/value-objects/ProgressStatus');
    
    // Создаем прогрессы уроков
    const lessonProgresses = lessonProgressRows.map(row => {
      return LessonProgress.create({
        id: row.id,
        lessonId: row.lesson_id,
        status: ProgressStatus.fromString(row.status),
        startedAt: row.started_at ? new Date(row.started_at) : undefined,
        completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
        notes: row.notes || undefined,
      });
    });

    // Создаем прогресс курса
    return CourseProgress.create({
      id: courseProgressRow.id,
      courseId: courseProgressRow.course_id,
      userId: courseProgressRow.user_id,
      startedAt: courseProgressRow.started_at ? new Date(courseProgressRow.started_at) : undefined,
      completedAt: courseProgressRow.completed_at ? new Date(courseProgressRow.completed_at) : undefined,
      lessonProgresses,
    });
  }
}
