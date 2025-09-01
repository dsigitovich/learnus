'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Course } from '@/lib/types';

export default function GenerateCoursePage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<Course | null>(null);

  useEffect(() => {
    generateCourseStructure();
  }, [courseId]);

  const generateCourseStructure = async () => {
    try {
      const response = await fetch(`/api/courses/${courseId}/generate`, {
        method: 'POST'
      });

      if (!response.ok) throw new Error('Ошибка генерации курса');
      
      const { data } = await response.json();
      setCourse(data);
      
      // Переход к редактору через 2 секунды
      setTimeout(() => {
        router.push(`/learn/course/${courseId}/edit`);
      }, 2000);
    } catch (error) {
      console.error('Error generating course:', error);
      alert('Не удалось сгенерировать курс');
      router.push('/learn');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-2xl w-full mx-auto p-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h1 className="text-2xl font-light text-gray-900 mb-6 text-center">
            Генерация курса...
          </h1>

          {loading ? (
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <p className="text-gray-600">ИИ создает структуру курса</p>
            </div>
          ) : course ? (
            <div className="space-y-4">
              <p className="text-center text-gray-600 mb-6">Курс успешно создан!</p>
              
              <div className="space-y-2">
                {course.blocks.map((block, index) => (
                  <div
                    key={block.id}
                    className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">
                        {index === 0 && '📝'}
                        {block.type === 'learning' && '❓'}
                        {block.type === 'practice' && '⚡'}
                        {block.type === 'reflection' && '💡'}
                      </span>
                      <span className="text-gray-700">{block.title}</span>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-center text-sm text-gray-500 mt-6">
                Перенаправление к редактору...
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}