'use client';

import React, { useEffect, useState } from 'react';
import { useUserProgress, useModuleProgress, UserProgressData, CalculatedModuleProgress } from '../../hooks/useProgress';
import { ProgressStats } from './ProgressStats';
import { CircularProgress } from './CircularProgress';
import { ProgressBar, SteppedProgressBar } from './ProgressBar';

interface ProgressDashboardProps {
  userId: string;
  moduleId?: string;
  totalLessons?: number;
  className?: string;
}

export function ProgressDashboard({ 
  userId, 
  moduleId, 
  totalLessons,
  className = '' 
}: ProgressDashboardProps) {
  const [userProgressData, setUserProgressData] = useState<UserProgressData | null>(null);
  const [moduleProgressData, setModuleProgressData] = useState<CalculatedModuleProgress | null>(null);
  
  const { getUserProgress, loading: userProgressLoading, error: userProgressError } = useUserProgress();
  const { calculateModuleProgress, loading: moduleProgressLoading, error: moduleProgressError } = useModuleProgress();

  // Загрузка данных о прогрессе пользователя
  useEffect(() => {
    const loadUserProgress = async () => {
      try {
        const data = await getUserProgress(userId, { moduleId, totalLessons });
        setUserProgressData(data);
      } catch (error) {
        console.error('Failed to load user progress:', error);
      }
    };

    loadUserProgress();
  }, [userId, moduleId, totalLessons, getUserProgress]);

  // Загрузка данных о прогрессе модуля (если указан)
  useEffect(() => {
    if (moduleId && totalLessons) {
      const loadModuleProgress = async () => {
        try {
          const data = await calculateModuleProgress({ userId, moduleId, totalLessons });
          setModuleProgressData(data);
        } catch (error) {
          console.error('Failed to load module progress:', error);
        }
      };

      loadModuleProgress();
    }
  }, [userId, moduleId, totalLessons, calculateModuleProgress]);

  const loading = userProgressLoading || moduleProgressLoading;
  const error = userProgressError || moduleProgressError;

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <CircularProgress percentage={0} size={60} color="#3b82f6" showPercentage={false}>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </CircularProgress>
          <p className="mt-4 text-gray-600">Loading progress data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-6 ${className}`}>
        <div className="flex items-center">
          <div className="text-red-400 mr-3">⚠️</div>
          <div>
            <h3 className="text-lg font-semibold text-red-900">Error Loading Progress</h3>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!userProgressData) {
    return (
      <div className={`bg-gray-50 border border-gray-200 rounded-lg p-6 ${className}`}>
        <div className="text-center">
          <div className="text-gray-400 text-4xl mb-4">📊</div>
          <h3 className="text-lg font-semibold text-gray-900">No Progress Data</h3>
          <p className="text-gray-600">Start learning to see your progress here!</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Специфический прогресс модуля */}
      {moduleProgressData && (
        <ModuleProgressSection moduleProgress={moduleProgressData} />
      )}

      {/* Общая статистика пользователя */}
      <ProgressStats
        statistics={userProgressData.statistics}
        moduleProgresses={userProgressData.moduleProgresses}
      />

      {/* Общий обзор прогресса */}
      <OverallProgressSection userProgress={userProgressData} />
    </div>
  );
}

interface ModuleProgressSectionProps {
  moduleProgress: CalculatedModuleProgress;
  className?: string;
}

function ModuleProgressSection({ moduleProgress, className = '' }: ModuleProgressSectionProps) {
  const getActionColor = (action: string) => {
    switch (action) {
      case 'start_next_lesson': return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'continue_current_lesson': return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'review_completed': return 'bg-purple-50 border-purple-200 text-purple-800';
      case 'module_completed': return 'bg-green-50 border-green-200 text-green-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'start_next_lesson': return '▶️';
      case 'continue_current_lesson': return '⏯️';
      case 'review_completed': return '📚';
      case 'module_completed': return '🎉';
      default: return '📖';
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          Module {moduleProgress.moduleId} Progress
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Визуальный прогресс */}
        <div className="space-y-4">
          <div className="flex items-center justify-center">
            <CircularProgress
              percentage={moduleProgress.progress.completionPercentage}
              size={150}
              strokeWidth={10}
              color={moduleProgress.progress.isCompleted ? '#10b981' : '#3b82f6'}
            />
          </div>
          
          <div className="text-center space-y-2">
            <div className="text-sm text-gray-600">
              {moduleProgress.progress.completedLessons} of {moduleProgress.progress.totalLessons} lessons completed
            </div>
            <div className="text-sm text-gray-600">
              Time spent: {moduleProgress.progress.formattedTimeSpent}
            </div>
            {!moduleProgress.progress.isCompleted && (
              <div className="text-sm text-gray-600">
                Estimated remaining: {moduleProgress.estimatedTimeRemaining}
              </div>
            )}
          </div>
        </div>

        {/* Информация и рекомендации */}
        <div className="space-y-4">
          {/* Рекомендуемое действие */}
          <div className={`border rounded-lg p-4 ${getActionColor(moduleProgress.recommendedNextAction)}`}>
            <div className="flex items-center mb-2">
              <span className="text-2xl mr-2">
                {getActionIcon(moduleProgress.recommendedNextAction)}
              </span>
              <h3 className="font-semibold">Recommended Action</h3>
            </div>
            <p className="text-sm">
              {moduleProgress.recommendedNextAction.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </p>
          </div>

          {/* Текущий и следующий урок */}
          <div className="space-y-3">
            {moduleProgress.currentLessonId && (
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium text-blue-900">Current Lesson:</span>
                <span className="text-sm text-blue-700">{moduleProgress.currentLessonId}</span>
              </div>
            )}
            
            {moduleProgress.nextLessonId && (
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-900">Next Lesson:</span>
                <span className="text-sm text-gray-700">{moduleProgress.nextLessonId}</span>
              </div>
            )}
          </div>

          {/* Рекомендации */}
          {moduleProgress.recommendations.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Recommendations:</h4>
              <ul className="space-y-1">
                {moduleProgress.recommendations.map((recommendation, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    {recommendation}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Пошаговый прогресс */}
      <div className="mt-6">
        <h4 className="font-semibold text-gray-900 mb-4">Lesson Progress</h4>
        <SteppedProgressBar
          currentStep={moduleProgress.progress.completedLessons + 1}
          totalSteps={moduleProgress.progress.totalLessons}
          showStepNumbers={true}
        />
      </div>
    </div>
  );
}

interface OverallProgressSectionProps {
  userProgress: UserProgressData;
  className?: string;
}

function OverallProgressSection({ userProgress, className = '' }: OverallProgressSectionProps) {
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Overall Learning Journey</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Модули */}
        <div className="text-center">
          <div className="mb-4">
            <CircularProgress
              percentage={userProgress.overallProgress.averageCompletionRate}
              size={100}
              color="#8b5cf6"
            />
          </div>
          <h3 className="font-semibold text-gray-900">Module Completion</h3>
          <p className="text-sm text-gray-600">
            {userProgress.overallProgress.completedModules} completed, {userProgress.overallProgress.inProgressModules} in progress
          </p>
        </div>

        {/* Время обучения */}
        <div className="text-center">
          <div className="mb-4">
            <div className="text-4xl font-bold text-orange-600">
              {userProgress.overallProgress.formattedTotalTime}
            </div>
          </div>
          <h3 className="font-semibold text-gray-900">Total Study Time</h3>
          <p className="text-sm text-gray-600">
            Across {userProgress.overallProgress.totalModules} modules
          </p>
        </div>

        {/* Достижения */}
        <div className="text-center">
          <div className="mb-4">
            <div className="text-4xl">
              {userProgress.statistics.currentStreak > 7 ? '🔥' : 
               userProgress.statistics.currentStreak > 3 ? '⭐' : '📚'}
            </div>
          </div>
          <h3 className="font-semibold text-gray-900">Achievement Level</h3>
          <p className="text-sm text-gray-600">
            {userProgress.statistics.currentStreak}-day streak
          </p>
        </div>
      </div>
    </div>
  );
}