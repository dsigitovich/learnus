import { Result } from '@shared/types/result';
import { Progress } from '../entities/Progress';
import { UserId } from '../value-objects/UserId';

export interface IProgressRepository {
  /**
   * Сохраняет или обновляет прогресс пользователя по модулю
   */
  save(progress: Progress): Promise<Result<void>>;

  /**
   * Находит прогресс пользователя по конкретному модулю
   */
  findByUserAndModule(userId: UserId, moduleId: string): Promise<Result<Progress | null>>;

  /**
   * Получает все прогрессы пользователя
   */
  findByUser(userId: UserId): Promise<Result<Progress[]>>;

  /**
   * Получает прогресс по ID
   */
  findById(progressId: string): Promise<Result<Progress | null>>;

  /**
   * Удаляет прогресс
   */
  delete(progressId: string): Promise<Result<void>>;

  /**
   * Получает статистику пользователя
   */
  getUserStatistics(userId: UserId): Promise<Result<UserStatistics>>;

  /**
   * Получает топ пользователей по прогрессу (для будущих социальных функций)
   */
  getTopUsers(limit: number): Promise<Result<UserProgressSummary[]>>;
}

export interface UserStatistics {
  totalModulesStarted: number;
  totalModulesCompleted: number;
  totalLessonsCompleted: number;
  totalTimeSpent: number; // в секундах
  currentStreak: number;
  longestStreak: number;
  averageTimePerLesson: number;
  completionRate: number; // процент завершенных модулей
}

export interface UserProgressSummary {
  userId: UserId;
  userName: string;
  totalModulesCompleted: number;
  totalTimeSpent: number;
  currentStreak: number;
}