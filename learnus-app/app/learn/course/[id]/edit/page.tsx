'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Course, CourseBlock, BlockDifficulty } from '@/lib/types';

export default function EditCoursePage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourse();
  }, [courseId]);

  const loadCourse = async () => {
    try {
      const response = await fetch(`/api/courses/${courseId}`);
      if (!response.ok) throw new Error('Ошибка загрузки курса');
      
      const { data } = await response.json();
      setCourse(data);
    } catch (error) {
      console.error('Error loading course:', error);
      alert('Не удалось загрузить курс');
      router.push('/learn');
    } finally {
      setLoading(false);
    }
  };

  const updateBlock = async (blockId: string, updates: Partial<CourseBlock>) => {
    try {
      const response = await fetch(`/api/courses/${courseId}/blocks/${blockId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (!response.ok) throw new Error('Ошибка обновления блока');
      
      await loadCourse();
    } catch (error) {
      console.error('Error updating block:', error);
      alert('Не удалось обновить блок');
    }
  };

  const deleteBlock = async (blockId: string) => {
    if (!confirm('Удалить этот блок?')) return;

    try {
      const response = await fetch(`/api/courses/${courseId}/blocks/${blockId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Ошибка удаления блока');
      
      await loadCourse();
    } catch (error) {
      console.error('Error deleting block:', error);
      alert('Не удалось удалить блок');
    }
  };

  const moveBlock = async (blockId: string, direction: 'up' | 'down') => {
    if (!course) return;

    const blockIndex = course.blocks.findIndex(b => b.id === blockId);
    if (blockIndex === -1) return;

    const newIndex = direction === 'up' ? blockIndex - 1 : blockIndex + 1;
    if (newIndex < 0 || newIndex >= course.blocks.length) return;

    try {
      const response = await fetch(`/api/courses/${courseId}/blocks/${blockId}/move`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newIndex })
      });

      if (!response.ok) throw new Error('Ошибка перемещения блока');
      
      await loadCourse();
    } catch (error) {
      console.error('Error moving block:', error);
      alert('Не удалось переместить блок');
    }
  };

  const startCourse = async () => {
    try {
      const response = await fetch(`/api/courses/${courseId}/start`, {
        method: 'POST'
      });

      if (!response.ok) throw new Error('Ошибка начала курса');
      
      const { data } = await response.json();
      router.push(`/learn/session/${data.sessionId}`);
    } catch (error) {
      console.error('Error starting course:', error);
      alert('Не удалось начать курс');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!course) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-light text-gray-900">
              Редактор курса: {course.config.topic}
            </h1>
            <button
              onClick={startCourse}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Сохранить и начать курс
            </button>
          </div>

          <div className="space-y-4">
            {course.blocks.map((block, index) => (
              <div
                key={block.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={block.title}
                      onChange={(e) => updateBlock(block.id, { title: e.target.value })}
                      className="text-lg font-medium text-gray-900 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none w-full"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => moveBlock(block.id, 'up')}
                      disabled={index === 0}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                      title="Переместить вверх"
                    >
                      ⬆️
                    </button>
                    <button
                      onClick={() => moveBlock(block.id, 'down')}
                      disabled={index === course.blocks.length - 1}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                      title="Переместить вниз"
                    >
                      ⬇️
                    </button>
                    <button
                      onClick={() => deleteBlock(block.id)}
                      className="p-1 text-gray-400 hover:text-red-600"
                      title="Удалить"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Тип блока</label>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700">
                      {block.type === 'introduction' && '📝 Введение'}
                      {block.type === 'learning' && '❓ Обучение'}
                      {block.type === 'practice' && '⚡ Практика'}
                      {block.type === 'reflection' && '💡 Рефлексия'}
                    </span>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Сложность</label>
                    <select
                      value={block.difficulty || 'medium'}
                      onChange={(e) => updateBlock(block.id, { difficulty: e.target.value as BlockDifficulty })}
                      className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="easy">Легкая</option>
                      <option value="medium">Средняя</option>
                      <option value="hard">Сложная</option>
                    </select>
                  </div>
                </div>

                {block.content && (
                  <div className="mt-3">
                    <textarea
                      value={block.content}
                      onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                      className="w-full px-3 py-2 text-sm text-gray-700 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      rows={2}
                    />
                  </div>
                )}

                {block.questions && block.questions.length > 0 && (
                  <div className="mt-3 text-sm text-gray-600">
                    {block.questions.length} вопросов
                  </div>
                )}
              </div>
            ))}
          </div>

          <button
            className="mt-6 w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors"
          >
            ➕ Добавить блок
          </button>
        </div>
      </div>
    </div>
  );
}