'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CourseConfig, LearningLevel, CourseLength, LearningStyle } from '@/lib/types';

export default function LearnPage() {
  const router = useRouter();
  const [config, setConfig] = useState<CourseConfig>({
    topic: '',
    level: 'beginner',
    goal: '',
    length: 'short',
    style: 'questions'
  });

  const handleCreateCourse = async () => {
    if (!config.topic.trim()) {
      alert('Пожалуйста, введите тему для изучения');
      return;
    }

    try {
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });

      if (!response.ok) throw new Error('Ошибка создания курса');
      
      const { data } = await response.json();
      router.push(`/learn/course/${data.id}/generate`);
    } catch (error) {
      console.error('Error creating course:', error);
      alert('Не удалось создать курс. Попробуйте еще раз.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h1 className="text-3xl font-light text-gray-900 mb-8 text-center">
            Что ты хочешь изучить?
          </h1>

          <div className="space-y-6">
            {/* Поле ввода темы */}
            <div>
              <input
                type="text"
                placeholder="Введи тему..."
                value={config.topic}
                onChange={(e) => setConfig({ ...config, topic: e.target.value })}
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Уровень сложности */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Уровень сложности
              </label>
              <select
                value={config.level}
                onChange={(e) => setConfig({ ...config, level: e.target.value as LearningLevel })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="beginner">Начальный</option>
                <option value="intermediate">Средний</option>
                <option value="advanced">Продвинутый</option>
              </select>
            </div>

            {/* Цель обучения */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Цель обучения
              </label>
              <textarea
                placeholder="Что ты хочешь достичь?"
                value={config.goal}
                onChange={(e) => setConfig({ ...config, goal: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {/* Длина курса */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Длина курса
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['short', 'medium', 'long'] as CourseLength[]).map((length) => (
                  <button
                    key={length}
                    onClick={() => setConfig({ ...config, length })}
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      config.length === length
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {length === 'short' && 'Короткий'}
                    {length === 'medium' && 'Средний'}
                    {length === 'long' && 'Длинный'}
                  </button>
                ))}
              </div>
            </div>

            {/* Стиль обучения */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Стиль обучения
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['questions', 'practice', 'theory'] as LearningStyle[]).map((style) => (
                  <button
                    key={style}
                    onClick={() => setConfig({ ...config, style })}
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      config.style === style
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {style === 'questions' && 'Вопросы'}
                    {style === 'practice' && 'Практика'}
                    {style === 'theory' && 'Теория'}
                  </button>
                ))}
              </div>
            </div>

            {/* Кнопка создания курса */}
            <button
              onClick={handleCreateCourse}
              className="w-full py-3 px-4 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Создать курс
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}