'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface ReflectionAnswers {
  newUnderstanding: string;
  conclusions: string;
  difficulties: string;
}

export default function ReflectionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;
  
  const [answers, setAnswers] = useState<ReflectionAnswers>({
    newUnderstanding: '',
    conclusions: '',
    difficulties: ''
  });

  const saveInsights = async () => {
    const insights = [];

    if (answers.newUnderstanding.trim()) {
      insights.push({
        type: 'new_understanding',
        content: answers.newUnderstanding
      });
    }

    if (answers.conclusions.trim()) {
      insights.push({
        type: 'conclusion',
        content: answers.conclusions
      });
    }

    if (answers.difficulties.trim()) {
      insights.push({
        type: 'difficulty',
        content: answers.difficulties
      });
    }

    if (insights.length === 0) {
      alert('Пожалуйста, заполните хотя бы один ответ');
      return;
    }

    try {
      const response = await fetch(`/api/sessions/${sessionId}/insights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ insights })
      });

      if (!response.ok) throw new Error('Ошибка сохранения инсайтов');

      // Переход к следующему блоку или завершение
      const nextResponse = await fetch(`/api/sessions/${sessionId}/next-block`, {
        method: 'POST'
      });

      if (!nextResponse.ok) throw new Error('Ошибка перехода');
      
      const { data } = await nextResponse.json();
      
      if (data.completed) {
        router.push(`/learn/progress/${data.courseId}`);
      } else {
        router.push(`/learn/session/${sessionId}`);
      }
    } catch (error) {
      console.error('Error saving insights:', error);
      alert('Не удалось сохранить инсайты');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="mb-8">
            <div className="flex items-center space-x-2 text-purple-600 mb-2">
              <span className="text-2xl">💡</span>
              <span className="text-sm font-medium uppercase tracking-wide">Рефлексия</span>
            </div>
            <h2 className="text-2xl font-light text-gray-900">
              Время подумать о том, что ты узнал
            </h2>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-3">
                1. Что нового я понял?
              </label>
              <textarea
                value={answers.newUnderstanding}
                onChange={(e) => setAnswers({ ...answers, newUnderstanding: e.target.value })}
                placeholder="Опиши новые знания или понимание, которые ты получил..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                rows={4}
              />
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-700 mb-3">
                2. Какие выводы сделал?
              </label>
              <textarea
                value={answers.conclusions}
                onChange={(e) => setAnswers({ ...answers, conclusions: e.target.value })}
                placeholder="Какие выводы ты можешь сделать на основе изученного..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                rows={4}
              />
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-700 mb-3">
                3. Какие моменты были сложными?
              </label>
              <textarea
                value={answers.difficulties}
                onChange={(e) => setAnswers({ ...answers, difficulties: e.target.value })}
                placeholder="Что было сложно понять или требует дополнительного изучения..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                rows={4}
              />
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={saveInsights}
              className="px-8 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
            >
              Сохранить инсайты
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}