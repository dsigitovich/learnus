'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { LearningSession, CourseBlock } from '@/lib/types';

export default function PracticePage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;
  
  const [session, setSession] = useState<LearningSession | null>(null);
  const [currentBlock, setCurrentBlock] = useState<CourseBlock | null>(null);
  const [practiceResult, setPracticeResult] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPractice();
  }, [sessionId]);

  const loadPractice = async () => {
    try {
      const sessionResponse = await fetch(`/api/sessions/${sessionId}`);
      if (!sessionResponse.ok) throw new Error('Ошибка загрузки сессии');
      
      const { data: sessionData } = await sessionResponse.json();
      setSession(sessionData);

      const blockResponse = await fetch(`/api/courses/${sessionData.courseId}/blocks/${sessionData.currentBlockId}`);
      if (!blockResponse.ok) throw new Error('Ошибка загрузки блока');
      
      const { data: blockData } = await blockResponse.json();
      setCurrentBlock(blockData);
    } catch (error) {
      console.error('Error loading practice:', error);
      alert('Не удалось загрузить практическое задание');
      router.push('/learn');
    } finally {
      setLoading(false);
    }
  };

  const completePractice = async () => {
    if (!practiceResult.trim()) {
      alert('Пожалуйста, опишите результат выполнения задания');
      return;
    }

    try {
      const response = await fetch(`/api/sessions/${sessionId}/complete-practice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ result: practiceResult })
      });

      if (!response.ok) throw new Error('Ошибка завершения практики');
      
      // Переход к следующему блоку
      const nextResponse = await fetch(`/api/sessions/${sessionId}/next-block`, {
        method: 'POST'
      });

      if (!nextResponse.ok) throw new Error('Ошибка перехода к следующему блоку');
      
      const { data } = await nextResponse.json();
      
      if (data.completed) {
        router.push(`/learn/progress/${session?.courseId}`);
      } else {
        router.push(`/learn/session/${sessionId}`);
      }
    } catch (error) {
      console.error('Error completing practice:', error);
      alert('Не удалось завершить практическое задание');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!session || !currentBlock) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="mb-6">
            <div className="flex items-center space-x-2 text-blue-600 mb-2">
              <span className="text-2xl">⚡</span>
              <span className="text-sm font-medium uppercase tracking-wide">Практическое задание</span>
            </div>
            <h2 className="text-2xl font-light text-gray-900">
              {currentBlock.title}
            </h2>
          </div>

          <div className="prose max-w-none mb-8">
            <div className="p-6 bg-gray-50 rounded-lg">
              <p className="text-gray-700 whitespace-pre-wrap">
                {currentBlock.content || 'Примени полученные знания на практике. Опиши, что ты сделал и какие результаты получил.'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Результат выполнения
              </label>
              <textarea
                value={practiceResult}
                onChange={(e) => setPracticeResult(e.target.value)}
                placeholder="Опиши, что ты сделал и какие результаты получил..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={6}
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={completePractice}
                disabled={!practiceResult.trim()}
                className="px-6 py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Готово → следующий вопрос
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}