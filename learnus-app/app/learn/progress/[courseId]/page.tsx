'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Course, UserProgress, Insight } from '@/lib/types';

export default function ProgressPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  
  const [course, setCourse] = useState<Course | null>(null);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgress();
  }, [courseId]);

  const loadProgress = async () => {
    try {
      // Загрузка курса
      const courseResponse = await fetch(`/api/courses/${courseId}`);
      if (!courseResponse.ok) throw new Error('Ошибка загрузки курса');
      const { data: courseData } = await courseResponse.json();
      setCourse(courseData);

      // Загрузка прогресса
      const progressResponse = await fetch(`/api/courses/${courseId}/progress`);
      if (!progressResponse.ok) throw new Error('Ошибка загрузки прогресса');
      const { data: progressData } = await progressResponse.json();
      setProgress(progressData);

      // Загрузка инсайтов
      const insightsResponse = await fetch(`/api/courses/${courseId}/insights`);
      if (!insightsResponse.ok) throw new Error('Ошибка загрузки инсайтов');
      const { data: insightsData } = await insightsResponse.json();
      setInsights(insightsData);
    } catch (error) {
      console.error('Error loading progress:', error);
      alert('Не удалось загрузить прогресс');
      router.push('/learn');
    } finally {
      setLoading(false);
    }
  };

  const continuelearning = async () => {
    try {
      const response = await fetch(`/api/courses/${courseId}/continue`, {
        method: 'POST'
      });

      if (!response.ok) throw new Error('Ошибка продолжения обучения');
      
      const { data } = await response.json();
      router.push(`/learn/session/${data.sessionId}`);
    } catch (error) {
      console.error('Error continuing course:', error);
      alert('Не удалось продолжить обучение');
    }
  };

  const repeatSession = async () => {
    try {
      const response = await fetch(`/api/courses/${courseId}/repeat`, {
        method: 'POST'
      });

      if (!response.ok) throw new Error('Ошибка повтора курса');
      
      const { data } = await response.json();
      router.push(`/learn/session/${data.sessionId}`);
    } catch (error) {
      console.error('Error repeating course:', error);
      alert('Не удалось повторить курс');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!course || !progress) return null;

  const completedPercentage = progress.progressPercentage;
  const isCompleted = completedPercentage === 100;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {/* Заголовок */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-light text-gray-900 mb-2">
              {isCompleted ? '🎉 Поздравляем!' : 'Твой прогресс'}
            </h1>
            <p className="text-gray-600">
              {course.config.topic}
            </p>
          </div>

          {/* Прогресс */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Общий прогресс</span>
              <span>{Math.round(completedPercentage)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${completedPercentage}%` }}
              />
            </div>
          </div>

          {/* Статистика */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <div className="text-3xl font-light text-gray-900">
                {progress.completedBlocks.length}
              </div>
              <div className="text-sm text-gray-600">Пройденных блоков</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-light text-gray-900">
                {progress.totalInsights}
              </div>
              <div className="text-sm text-gray-600">Инсайтов</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-light text-gray-900">
                {course.blocks.length}
              </div>
              <div className="text-sm text-gray-600">Всего блоков</div>
            </div>
          </div>

          {/* Блоки курса */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Структура курса</h3>
            <div className="space-y-2">
              {course.blocks.map((block) => {
                const isCompleted = progress.completedBlocks.includes(block.id);
                return (
                  <div
                    key={block.id}
                    className={`p-3 rounded-lg border ${
                      isCompleted
                        ? 'bg-green-50 border-green-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">
                          {isCompleted ? '✅' : '⭕'}
                        </span>
                        <span className={isCompleted ? 'text-green-700' : 'text-gray-700'}>
                          {block.title}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {block.type === 'introduction' && 'Введение'}
                        {block.type === 'learning' && 'Обучение'}
                        {block.type === 'practice' && 'Практика'}
                        {block.type === 'reflection' && 'Рефлексия'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Последние инсайты */}
          {insights.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Твои инсайты</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {insights.slice(0, 5).map((insight) => (
                  <div key={insight.id} className="p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <span className="text-purple-600">
                        {insight.type === 'new_understanding' && '💡'}
                        {insight.type === 'conclusion' && '📝'}
                        {insight.type === 'difficulty' && '🤔'}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm text-gray-700">{insight.content}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(insight.createdAt).toLocaleDateString('ru-RU')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Действия */}
          <div className="flex flex-col sm:flex-row gap-4">
            {!isCompleted && (
              <button
                onClick={continuelearning}
                className="flex-1 py-3 px-6 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors"
              >
                Продолжить обучение
              </button>
            )}
            <button
              onClick={repeatSession}
              className="flex-1 py-3 px-6 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Повторить курс
            </button>
            <button
              onClick={() => router.push('/learn')}
              className="flex-1 py-3 px-6 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Новый курс
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}