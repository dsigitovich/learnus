'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  BookOpen, 
  BarChart3, 
  CheckCircle2, 
  Circle, 
  Clock,
  Award,
  TrendingUp,
  Target
} from 'lucide-react';
import { useStore } from '@/lib/store';
import type { Course, CourseProgress } from '@/lib/types';

interface ProgressPageProps {}

export default function ProgressPage({}: ProgressPageProps) {
  const router = useRouter();
  const { courses, chats } = useStore();
  const [courseProgresses, setCourseProgresses] = useState<Map<string, any>>(new Map());

  // Получаем прогресс для всех курсов
  useEffect(() => {
    const progressMap = new Map();
    
    courses.forEach(course => {
      // Находим чат для этого курса
      const courseChat = chats.find(chat => 
        chat.type === 'course' && chat.courseId === course.id
      );
      
      if (courseChat?.courseProgress) {
        progressMap.set(course.id, courseChat.courseProgress);
      }
    });
    
    setCourseProgresses(progressMap);
  }, [courses, chats]);

  const getOverallProgress = () => {
    if (courses.length === 0) return 0;
    
    let totalProgress = 0;
    courses.forEach(course => {
      const progress = courseProgresses.get(course.id);
      if (progress) {
        totalProgress += progress.progressPercentage || 0;
      }
    });
    
    return Math.round(totalProgress / courses.length);
  };

  const getCompletedCourses = () => {
    return courses.filter(course => {
      const progress = courseProgresses.get(course.id);
      return progress && progress.progressPercentage >= 100;
    }).length;
  };

  const getInProgressCourses = () => {
    return courses.filter(course => {
      const progress = courseProgresses.get(course.id);
      return progress && progress.progressPercentage > 0 && progress.progressPercentage < 100;
    }).length;
  };

  const handleCourseClick = (courseId: string) => {
    router.push(`/courses/${courseId}`);
  };

  const handleBackToChat = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBackToChat}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                title="Вернуться к чату"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <BarChart3 className="text-blue-600 dark:text-blue-400" size={20} />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Мой прогресс
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Отслеживайте свой прогресс обучения
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <BookOpen className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Всего курсов</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {courses.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="text-green-600 dark:text-green-400" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Завершено</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {getCompletedCourses()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                <Clock className="text-yellow-600 dark:text-yellow-400" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">В процессе</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {getInProgressCourses()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-purple-600 dark:text-purple-400" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Общий прогресс</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {getOverallProgress()}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Список курсов */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Target size={20} />
            Мои курсы
          </h2>

          {courses.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="text-gray-400" size={32} />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Пока нет курсов
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Создайте свой первый курс, написав в чате "создай курс по..."
              </p>
              <button
                onClick={handleBackToChat}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Перейти к чату
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {courses.map((course) => {
                const progress = courseProgresses.get(course.id);
                const progressPercentage = progress?.progressPercentage || 0;
                const isCompleted = progressPercentage >= 100;
                const isInProgress = progressPercentage > 0 && progressPercentage < 100;

                return (
                  <div
                    key={course.id}
                    onClick={() => handleCourseClick(course.id)}
                    className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                          {course.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {course.description}
                        </p>
                      </div>
                      <div className="ml-4">
                        {isCompleted ? (
                          <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="text-green-600 dark:text-green-400" size={16} />
                          </div>
                        ) : isInProgress ? (
                          <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                            <Clock className="text-yellow-600 dark:text-yellow-400" size={16} />
                          </div>
                        ) : (
                          <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                            <Circle className="text-gray-400" size={16} />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Прогресс бар */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Прогресс
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {progressPercentage}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            isCompleted
                              ? 'bg-green-500'
                              : isInProgress
                              ? 'bg-blue-500'
                              : 'bg-gray-300'
                          }`}
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Детали прогресса */}
                    {progress && (
                      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                        <span>
                          Модуль {progress.currentModuleIndex + 1} из {course.modules.length}
                        </span>
                        <span>
                          Урок {progress.currentLessonIndex + 1} из {course.modules[progress.currentModuleIndex]?.lessons.length || 0}
                        </span>
                      </div>
                    )}

                    {/* Статус */}
                    <div className="mt-4">
                      {isCompleted ? (
                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                          <Award size={16} />
                          <span className="text-sm font-medium">Курс завершен!</span>
                        </div>
                      ) : isInProgress ? (
                        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                          <Clock size={16} />
                          <span className="text-sm font-medium">В процессе изучения</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                          <Circle size={16} />
                          <span className="text-sm font-medium">Не начат</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
