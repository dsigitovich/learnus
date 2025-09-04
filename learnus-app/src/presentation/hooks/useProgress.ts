import { useState, useCallback } from 'react';
import { LessonProgressStatus } from '@domain/value-objects/LessonProgress';

// Типы для API ответов
export interface LessonProgressData {
  lessonId: string;
  status: LessonProgressStatus;
  timeSpent: number;
  completedAt?: string;
  attempts: number;
}

export interface ModuleProgressData {
  completedLessons: number;
  totalLessons: number;
  completionPercentage: number;
  isCompleted: boolean;
  totalTimeSpent: number;
  formattedTimeSpent: string;
  remainingLessons?: number;
  progressLevel?: string;
}

export interface ModuleProgressSummary {
  moduleId: string;
  progress: ModuleProgressData;
  startedAt: string;
  lastAccessedAt?: string;
  completedAt?: string;
  currentLessonId?: string;
  nextLessonId?: string;
}

export interface UserStatistics {
  totalModulesStarted: number;
  totalModulesCompleted: number;
  totalLessonsCompleted: number;
  totalTimeSpent: number;
  currentStreak: number;
  longestStreak: number;
  averageTimePerLesson: number;
  completionRate: number;
  formattedTotalTime: string;
  formattedAverageTime: string;
}

export interface UserProgressData {
  userId: string;
  moduleProgresses: ModuleProgressSummary[];
  statistics: UserStatistics;
  overallProgress: {
    totalModules: number;
    completedModules: number;
    inProgressModules: number;
    totalTimeSpent: number;
    averageCompletionRate: number;
    formattedTotalTime: string;
  };
}

export interface CalculatedModuleProgress {
  moduleId: string;
  progress: ModuleProgressData;
  estimatedTimeRemaining: string;
  recommendedNextAction: 'start_next_lesson' | 'continue_current_lesson' | 'review_completed' | 'module_completed';
  currentLessonId?: string;
  nextLessonId?: string;
  recommendations: string[];
}

// Хук для отслеживания прогресса урока
export function useTrackProgress() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trackProgress = useCallback(async (data: {
    userId: string;
    moduleId: string;
    lessonId: string;
    status: LessonProgressStatus;
    timeSpent: number;
    completedAt?: Date;
  }) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/progress/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          completedAt: data.completedAt?.toISOString(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to track progress');
      }

      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { trackProgress, loading, error };
}

// Хук для получения прогресса пользователя
export function useUserProgress() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getUserProgress = useCallback(async (
    userId: string,
    options?: {
      moduleId?: string;
      totalLessons?: number;
    }
  ): Promise<UserProgressData> => {
    setLoading(true);
    setError(null);

    try {
      const searchParams = new URLSearchParams();
      if (options?.moduleId) {
        searchParams.append('moduleId', options.moduleId);
      }
      if (options?.totalLessons) {
        searchParams.append('totalLessons', options.totalLessons.toString());
      }

      const url = `/api/progress/user/${userId}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
      const response = await fetch(url);

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to get user progress');
      }

      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { getUserProgress, loading, error };
}

// Хук для расчета прогресса модуля
export function useModuleProgress() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateModuleProgress = useCallback(async (data: {
    userId: string;
    moduleId: string;
    totalLessons: number;
  }): Promise<CalculatedModuleProgress | null> => {
    setLoading(true);
    setError(null);

    try {
      const searchParams = new URLSearchParams({
        userId: data.userId,
        moduleId: data.moduleId,
        totalLessons: data.totalLessons.toString(),
      });

      const response = await fetch(`/api/progress/module?${searchParams.toString()}`);

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to calculate module progress');
      }

      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { calculateModuleProgress, loading, error };
}

// Комбинированный хук для всех операций с прогрессом
export function useProgressOperations() {
  const trackProgress = useTrackProgress();
  const userProgress = useUserProgress();
  const moduleProgress = useModuleProgress();

  return {
    trackProgress: trackProgress.trackProgress,
    getUserProgress: userProgress.getUserProgress,
    calculateModuleProgress: moduleProgress.calculateModuleProgress,
    loading: trackProgress.loading || userProgress.loading || moduleProgress.loading,
    error: trackProgress.error || userProgress.error || moduleProgress.error,
  };
}