import Database from 'better-sqlite3';
import { Result } from '@shared/types/result';
import { Progress } from '@domain/entities/Progress';
import { UserId } from '@domain/value-objects/UserId';
import { LessonProgress, LessonProgressStatus } from '@domain/value-objects/LessonProgress';
import { 
  IProgressRepository, 
  UserStatistics, 
  UserProgressSummary 
} from '@domain/repositories/IProgressRepository';

interface ProgressRow {
  id: string;
  user_id: string;
  module_id: string;
  started_at: string;
  last_accessed_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

interface LessonProgressRow {
  id: string;
  progress_id: string;
  lesson_id: string;
  status: string;
  started_at: string;
  completed_at: string | null;
  time_spent: number;
  attempts: number;
  last_attempt_at: string | null;
}

export class ProgressRepository implements IProgressRepository {
  private db: Database.Database;

  constructor(database: Database.Database) {
    this.db = database;
    this.initTables();
  }

  private initTables(): void {
    // Создаем таблицу для основного прогресса
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS progress (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        module_id TEXT NOT NULL,
        started_at TEXT NOT NULL,
        last_accessed_at TEXT,
        completed_at TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, module_id)
      )
    `);

    // Создаем таблицу для прогресса по урокам
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS lesson_progress (
        id TEXT PRIMARY KEY,
        progress_id TEXT NOT NULL,
        lesson_id TEXT NOT NULL,
        status TEXT NOT NULL,
        started_at TEXT NOT NULL,
        completed_at TEXT,
        time_spent INTEGER NOT NULL DEFAULT 0,
        attempts INTEGER NOT NULL DEFAULT 0,
        last_attempt_at TEXT,
        FOREIGN KEY (progress_id) REFERENCES progress (id) ON DELETE CASCADE,
        UNIQUE(progress_id, lesson_id)
      )
    `);

    // Создаем индексы для быстрого поиска
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_progress_user_id ON progress(user_id);
      CREATE INDEX IF NOT EXISTS idx_progress_module_id ON progress(module_id);
      CREATE INDEX IF NOT EXISTS idx_lesson_progress_progress_id ON lesson_progress(progress_id);
      CREATE INDEX IF NOT EXISTS idx_lesson_progress_lesson_id ON lesson_progress(lesson_id);
    `);
  }

  async save(progress: Progress): Promise<Result<void>> {
    try {
      const transaction = this.db.transaction(() => {
        // Сохраняем основной прогресс
        const progressStmt = this.db.prepare(`
          INSERT INTO progress (
            id, user_id, module_id, started_at, last_accessed_at, completed_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(user_id, module_id) DO UPDATE SET
            last_accessed_at = excluded.last_accessed_at,
            completed_at = excluded.completed_at,
            updated_at = excluded.updated_at
        `);

        progressStmt.run(
          progress.id,
          progress.userId.toString(),
          progress.moduleId,
          progress.startedAt.toISOString(),
          progress.lastAccessedAt?.toISOString() || null,
          progress.completedAt?.toISOString() || null,
          new Date().toISOString()
        );

        // Удаляем старые записи прогресса по урокам для этого модуля
        const deleteStmt = this.db.prepare('DELETE FROM lesson_progress WHERE progress_id = ?');
        deleteStmt.run(progress.id);

        // Сохраняем прогресс по урокам
        const lessonStmt = this.db.prepare(`
          INSERT INTO lesson_progress (
            id, progress_id, lesson_id, status, started_at, completed_at, 
            time_spent, attempts, last_attempt_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        for (const lessonProgress of progress.lessonProgresses) {
          lessonStmt.run(
            this.generateId(),
            progress.id,
            lessonProgress.lessonId,
            lessonProgress.status,
            lessonProgress.startedAt.toISOString(),
            lessonProgress.completedAt?.toISOString() || null,
            lessonProgress.timeSpent,
            lessonProgress.attempts,
            lessonProgress.lastAttemptAt?.toISOString() || null
          );
        }
      });

      transaction();
      return Result.ok();
    } catch (error) {
      return Result.fail(error as Error);
    }
  }

  async findByUserAndModule(userId: UserId, moduleId: string): Promise<Result<Progress | null>> {
    try {
      const progressRow = this.db.prepare(`
        SELECT * FROM progress 
        WHERE user_id = ? AND module_id = ?
      `).get(userId.toString(), moduleId) as ProgressRow | undefined;

      if (!progressRow) {
        return Result.ok(null);
      }

      const lessonProgressRows = this.db.prepare(`
        SELECT * FROM lesson_progress 
        WHERE progress_id = ?
        ORDER BY started_at ASC
      `).all(progressRow.id) as LessonProgressRow[];

      const progress = await this.mapToProgress(progressRow, lessonProgressRows);
      return Result.ok(progress);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }

  async findByUser(userId: UserId): Promise<Result<Progress[]>> {
    try {
      const progressRows = this.db.prepare(`
        SELECT * FROM progress 
        WHERE user_id = ?
        ORDER BY started_at DESC
      `).all(userId.toString()) as ProgressRow[];

      const progresses: Progress[] = [];

      for (const progressRow of progressRows) {
        const lessonProgressRows = this.db.prepare(`
          SELECT * FROM lesson_progress 
          WHERE progress_id = ?
          ORDER BY started_at ASC
        `).all(progressRow.id) as LessonProgressRow[];

        const progress = await this.mapToProgress(progressRow, lessonProgressRows);
        progresses.push(progress);
      }

      return Result.ok(progresses);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }

  async findById(progressId: string): Promise<Result<Progress | null>> {
    try {
      const progressRow = this.db.prepare(`
        SELECT * FROM progress WHERE id = ?
      `).get(progressId) as ProgressRow | undefined;

      if (!progressRow) {
        return Result.ok(null);
      }

      const lessonProgressRows = this.db.prepare(`
        SELECT * FROM lesson_progress 
        WHERE progress_id = ?
        ORDER BY started_at ASC
      `).all(progressId) as LessonProgressRow[];

      const progress = await this.mapToProgress(progressRow, lessonProgressRows);
      return Result.ok(progress);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }

  async delete(progressId: string): Promise<Result<void>> {
    try {
      const stmt = this.db.prepare('DELETE FROM progress WHERE id = ?');
      stmt.run(progressId);
      return Result.ok();
    } catch (error) {
      return Result.fail(error as Error);
    }
  }

  async getUserStatistics(userId: UserId): Promise<Result<UserStatistics>> {
    try {
      const stats = this.db.prepare(`
        SELECT 
          COUNT(*) as total_modules_started,
          COUNT(CASE WHEN completed_at IS NOT NULL THEN 1 END) as total_modules_completed,
          COALESCE(SUM(lesson_stats.lessons_completed), 0) as total_lessons_completed,
          COALESCE(SUM(lesson_stats.total_time), 0) as total_time_spent,
          COALESCE(AVG(lesson_stats.avg_time_per_lesson), 0) as average_time_per_lesson
        FROM progress p
        LEFT JOIN (
          SELECT 
            progress_id,
            COUNT(CASE WHEN status = 'completed' THEN 1 END) as lessons_completed,
            SUM(time_spent) as total_time,
            AVG(CASE WHEN status = 'completed' AND time_spent > 0 THEN time_spent END) as avg_time_per_lesson
          FROM lesson_progress
          GROUP BY progress_id
        ) lesson_stats ON p.id = lesson_stats.progress_id
        WHERE p.user_id = ?
      `).get(userId.toString()) as any;

      const completionRate = stats.total_modules_started > 0 
        ? (stats.total_modules_completed / stats.total_modules_started) * 100 
        : 0;

      // Простая реализация streak - можно улучшить
      const currentStreak = this.calculateCurrentStreak(userId);
      const longestStreak = this.calculateLongestStreak(userId);

      const userStats: UserStatistics = {
        totalModulesStarted: stats.total_modules_started,
        totalModulesCompleted: stats.total_modules_completed,
        totalLessonsCompleted: stats.total_lessons_completed,
        totalTimeSpent: stats.total_time_spent,
        currentStreak,
        longestStreak,
        averageTimePerLesson: stats.average_time_per_lesson || 0,
        completionRate
      };

      return Result.ok(userStats);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }

  async getTopUsers(limit: number): Promise<Result<UserProgressSummary[]>> {
    try {
      const topUsers = this.db.prepare(`
        SELECT 
          p.user_id,
          COUNT(CASE WHEN p.completed_at IS NOT NULL THEN 1 END) as total_modules_completed,
          COALESCE(SUM(lesson_stats.total_time), 0) as total_time_spent
        FROM progress p
        LEFT JOIN (
          SELECT 
            progress_id,
            SUM(time_spent) as total_time
          FROM lesson_progress
          GROUP BY progress_id
        ) lesson_stats ON p.id = lesson_stats.progress_id
        GROUP BY p.user_id
        ORDER BY total_modules_completed DESC, total_time_spent DESC
        LIMIT ?
      `).all(limit) as any[];

      const summaries: UserProgressSummary[] = topUsers.map(row => ({
        userId: UserId.create(row.user_id).getValue(),
        userName: `User ${row.user_id}`, // Здесь нужно будет получать имя из User repository
        totalModulesCompleted: row.total_modules_completed,
        totalTimeSpent: row.total_time_spent,
        currentStreak: this.calculateCurrentStreak(UserId.create(row.user_id).getValue())
      }));

      return Result.ok(summaries);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }

  private async mapToProgress(progressRow: ProgressRow, lessonProgressRows: LessonProgressRow[]): Promise<Progress> {
    const userId = UserId.create(progressRow.user_id).getValue();
    
    const lessonProgresses: LessonProgress[] = [];
    for (const row of lessonProgressRows) {
      const lessonProgress = LessonProgress.create({
        lessonId: row.lesson_id,
        status: row.status as LessonProgressStatus,
        startedAt: new Date(row.started_at),
        completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
        timeSpent: row.time_spent,
        attempts: row.attempts,
        lastAttemptAt: row.last_attempt_at ? new Date(row.last_attempt_at) : undefined
      });

      if (lessonProgress.isSuccess) {
        lessonProgresses.push(lessonProgress.getValue());
      }
    }

    const progress = Progress.create({
      userId,
      moduleId: progressRow.module_id,
      lessonProgresses,
      startedAt: new Date(progressRow.started_at),
      lastAccessedAt: progressRow.last_accessed_at ? new Date(progressRow.last_accessed_at) : undefined,
      completedAt: progressRow.completed_at ? new Date(progressRow.completed_at) : undefined
    }, progressRow.id);

    return progress.getValue();
  }

  private calculateCurrentStreak(userId: UserId): number {
    // Упрощенная реализация - считаем дни подряд с активностью
    const recentActivity = this.db.prepare(`
      SELECT DATE(last_accessed_at) as activity_date
      FROM progress 
      WHERE user_id = ? AND last_accessed_at IS NOT NULL
      ORDER BY last_accessed_at DESC
      LIMIT 30
    `).all(userId.toString()) as any[];

    if (recentActivity.length === 0) return 0;

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const activity of recentActivity) {
      const activityDate = new Date(activity.activity_date);
      const diffDays = Math.floor((currentDate.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === streak) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  private calculateLongestStreak(userId: UserId): number {
    // Упрощенная реализация - можно улучшить
    return this.calculateCurrentStreak(userId); // Пока возвращаем текущий streak
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}