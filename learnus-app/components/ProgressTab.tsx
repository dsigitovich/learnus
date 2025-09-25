'use client';

import { useState, useEffect } from 'react';
import { CheckCircleIcon, ClockIcon, PlayIcon } from '@heroicons/react/24/outline';
import { useStore } from '@/lib/store';

interface LessonProgress {
  id: string;
  lessonId: string;
  status: string;
  startedAt?: string;
  completedAt?: string;
  durationInMinutes?: number;
  notes?: string;
}


interface ProgressTabProps {
  courseId: string;
  courseTitle?: string;
  lessons: Array<{
    id: string;
    title: string;
    type: 'theory' | 'exercise';
    content: string;
  }>;
}

export default function ProgressTab({ courseId, lessons }: ProgressTabProps) {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  
  const { 
    courseProgressData, 
    fetchCourseProgress, 
    updateLessonProgress: updateLessonProgressStore 
  } = useStore();
  
  const courseProgress = courseProgressData[courseId];

  useEffect(() => {
    loadCourseProgress();
  }, [courseId]);

  const loadCourseProgress = async () => {
    try {
      setLoading(true);
      await fetchCourseProgress(courseId);
    } catch (error) {
      console.error('Error loading course progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateLessonProgress = async (lessonId: string, status: 'not_started' | 'in_progress' | 'completed') => {
    try {
      setUpdating(lessonId);
      await updateLessonProgressStore(courseId, lessonId, status);
    } catch (error) {
      console.error('Error updating lesson progress:', error);
    } finally {
      setUpdating(null);
    }
  };

  const getLessonProgress = (lessonId: string): LessonProgress | undefined => {
    return courseProgress?.lessonProgresses.find(lp => lp.lessonId === lessonId);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'in_progress':
        return <PlayIcon className="w-5 h-5 text-blue-500" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Завершено';
      case 'in_progress':
        return 'В процессе';
      default:
        return 'Не начато';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="ml-2">Загрузка прогресса...</p>
      </div>
    );
  }

  // Debug information
  console.log('ProgressTab render:', { courseId, courseProgress, lessons: lessons.length });

  return (
    <div className="space-y-6">
      {/* Debug info */}
      <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
        <h4 className="font-medium text-yellow-800">Отладочная информация:</h4>
        <p className="text-sm text-yellow-700">Course ID: {courseId}</p>
        <p className="text-sm text-yellow-700">Уроков: {lessons.length}</p>
        <p className="text-sm text-yellow-700">Прогресс: {courseProgress ? 'Загружен' : 'Не загружен'}</p>
      </div>

      {/* Progress Overview */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Прогресс курса</h3>
        
        {courseProgress ? (
          <div className="space-y-4">
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${courseProgress.completionPercentage}%` }}
              ></div>
            </div>
            
            {/* Progress Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{courseProgress.completionPercentage}%</div>
                <div className="text-sm text-gray-600">Завершено</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{courseProgress.completedLessons}</div>
                <div className="text-sm text-gray-600">Завершено уроков</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{courseProgress.inProgressLessons}</div>
                <div className="text-sm text-gray-600">В процессе</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">{courseProgress.notStartedLessons}</div>
                <div className="text-sm text-gray-600">Не начато</div>
              </div>
            </div>

            {/* Duration Stats */}
            {courseProgress.totalDurationInMinutes && courseProgress.totalDurationInMinutes > 0 && (
              <div className="pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Общее время изучения:</span> {Math.floor(courseProgress.totalDurationInMinutes / 60)}ч {courseProgress.totalDurationInMinutes % 60}м
                  </div>
                  {courseProgress.averageLessonDurationInMinutes && (
                    <div>
                      <span className="font-medium">Среднее время урока:</span> {courseProgress.averageLessonDurationInMinutes}м
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">Прогресс не найден. Начните изучение курса!</p>
            <button 
              onClick={() => loadCourseProgress()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Обновить прогресс
            </button>
          </div>
        )}
      </div>

      {/* Lessons List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Уроки курса</h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {lessons.map((lesson, index) => {
            const lessonProgress = getLessonProgress(lesson.id);
            const status = lessonProgress?.status || 'not_started';
            const isUpdating = updating === lesson.id;

            return (
              <div key={lesson.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {getStatusIcon(status)}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-medium text-gray-900">
                          {index + 1}. {lesson.title}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {lesson.type === 'theory' ? 'Теория' : 'Практика'}
                        </p>
                        {lessonProgress?.notes && (
                          <p className="text-sm text-gray-500 mt-2 italic">
                            &quot;{lessonProgress.notes}&quot;
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
                      {getStatusText(status)}
                    </span>
                    
                    <div className="flex space-x-2">
                      {status === 'not_started' && (
                        <button
                          onClick={() => updateLessonProgress(lesson.id, 'in_progress')}
                          disabled={isUpdating}
                          className="px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-800 disabled:opacity-50"
                        >
                          {isUpdating ? 'Обновление...' : 'Начать'}
                        </button>
                      )}
                      
                      {status === 'in_progress' && (
                        <button
                          onClick={() => updateLessonProgress(lesson.id, 'completed')}
                          disabled={isUpdating}
                          className="px-3 py-1 text-sm font-medium text-green-600 hover:text-green-800 disabled:opacity-50"
                        >
                          {isUpdating ? 'Обновление...' : 'Завершить'}
                        </button>
                      )}
                      
                      {status === 'completed' && (
                        <button
                          onClick={() => updateLessonProgress(lesson.id, 'not_started')}
                          disabled={isUpdating}
                          className="px-3 py-1 text-sm font-medium text-gray-600 hover:text-gray-800 disabled:opacity-50"
                        >
                          {isUpdating ? 'Обновление...' : 'Начать заново'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}