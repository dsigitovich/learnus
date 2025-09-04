'use client';

import React from 'react';
import { CircularProgress, MiniCircularProgress } from './CircularProgress';
import { ProgressBar } from './ProgressBar';
import { UserStatistics, ModuleProgressSummary } from '../../hooks/useProgress';

interface ProgressStatsProps {
  statistics: UserStatistics;
  moduleProgresses?: ModuleProgressSummary[];
  className?: string;
}

export function ProgressStats({ 
  statistics, 
  moduleProgresses = [], 
  className = '' 
}: ProgressStatsProps) {
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      {/* Заголовок */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Learning Progress</h2>
        <p className="text-gray-600">Track your learning journey and achievements</p>
      </div>

      {/* Основная статистика */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Общий прогресс */}
        <div className="text-center">
          <CircularProgress
            percentage={statistics.completionRate}
            size={100}
            strokeWidth={8}
            color="#10b981"
            className="mb-3"
          />
          <h3 className="text-lg font-semibold text-gray-900">Overall Progress</h3>
          <p className="text-sm text-gray-600">{statistics.completionRate.toFixed(1)}% Complete</p>
        </div>

        {/* Модули */}
        <div className="text-center">
          <div className="mb-3">
            <div className="text-3xl font-bold text-blue-600">
              {statistics.totalModulesCompleted}
            </div>
            <div className="text-sm text-gray-500">
              of {statistics.totalModulesStarted}
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Modules</h3>
          <p className="text-sm text-gray-600">Completed</p>
        </div>

        {/* Уроки */}
        <div className="text-center">
          <div className="mb-3">
            <div className="text-3xl font-bold text-purple-600">
              {statistics.totalLessonsCompleted}
            </div>
            <div className="text-sm text-gray-500">lessons</div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Lessons</h3>
          <p className="text-sm text-gray-600">Completed</p>
        </div>

        {/* Время обучения */}
        <div className="text-center">
          <div className="mb-3">
            <div className="text-3xl font-bold text-orange-600">
              {statistics.formattedTotalTime}
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Study Time</h3>
          <p className="text-sm text-gray-600">Total</p>
        </div>
      </div>

      {/* Streak информация */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Current Streak</h3>
              <p className="text-sm text-gray-600">Days in a row</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-orange-600">
                {statistics.currentStreak}
              </div>
              <div className="text-sm text-orange-500">🔥</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Best Streak</h3>
              <p className="text-sm text-gray-600">Personal record</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-green-600">
                {statistics.longestStreak}
              </div>
              <div className="text-sm text-green-500">🏆</div>
            </div>
          </div>
        </div>
      </div>

      {/* Средние показатели */}
      <div className="bg-gray-50 rounded-lg p-4 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Average Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Time per lesson:</span>
            <span className="font-semibold text-gray-900">
              {statistics.formattedAverageTime}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Completion rate:</span>
            <span className="font-semibold text-gray-900">
              {statistics.completionRate.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Прогресс по модулям */}
      {moduleProgresses.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Module Progress</h3>
          <div className="space-y-4">
            {moduleProgresses.map((moduleProgress) => (
              <ModuleProgressCard 
                key={moduleProgress.moduleId} 
                moduleProgress={moduleProgress} 
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface ModuleProgressCardProps {
  moduleProgress: ModuleProgressSummary;
  className?: string;
}

function ModuleProgressCard({ moduleProgress, className = '' }: ModuleProgressCardProps) {
  const { progress } = moduleProgress;
  
  const getStatusColor = () => {
    if (progress.isCompleted) return 'text-green-600';
    if (progress.completionPercentage > 0) return 'text-blue-600';
    return 'text-gray-400';
  };

  const getStatusText = () => {
    if (progress.isCompleted) return 'Completed';
    if (progress.completionPercentage > 0) return 'In Progress';
    return 'Not Started';
  };

  return (
    <div className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="font-semibold text-gray-900">
            Module {moduleProgress.moduleId}
          </h4>
          <p className={`text-sm ${getStatusColor()}`}>
            {getStatusText()}
          </p>
        </div>
        <MiniCircularProgress
          percentage={progress.completionPercentage}
          size={50}
          color={progress.isCompleted ? '#10b981' : '#3b82f6'}
        />
      </div>

      <div className="space-y-2">
        <ProgressBar
          percentage={progress.completionPercentage}
          height={6}
          color={progress.isCompleted ? '#10b981' : '#3b82f6'}
          showPercentage={false}
          animated={true}
        />
        
        <div className="flex justify-between text-sm text-gray-600">
          <span>
            {progress.completedLessons} of {progress.totalLessons} lessons
          </span>
          <span>{progress.formattedTimeSpent}</span>
        </div>
      </div>

      {moduleProgress.nextLessonId && (
        <div className="mt-3 pt-3 border-t">
          <p className="text-sm text-gray-600">
            Next: <span className="font-medium">Lesson {moduleProgress.nextLessonId}</span>
          </p>
        </div>
      )}
    </div>
  );
}

// Компактная версия статистики
export function CompactProgressStats({ statistics, className = '' }: Omit<ProgressStatsProps, 'moduleProgresses'>) {
  return (
    <div className={`bg-white rounded-lg shadow-sm p-4 ${className}`}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {statistics.totalModulesCompleted}
          </div>
          <div className="text-xs text-gray-500">Modules</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {statistics.totalLessonsCompleted}
          </div>
          <div className="text-xs text-gray-500">Lessons</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">
            {statistics.currentStreak}
          </div>
          <div className="text-xs text-gray-500">Streak</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {statistics.formattedTotalTime}
          </div>
          <div className="text-xs text-gray-500">Time</div>
        </div>
      </div>
    </div>
  );
}