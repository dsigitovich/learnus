'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { LearningSession, CourseBlock, Question, Course } from '@/lib/types';

export default function SessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;
  
  const [session, setSession] = useState<LearningSession | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [currentBlock, setCurrentBlock] = useState<CourseBlock | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [answer, setAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSession();
  }, [sessionId]);

  const loadSession = async () => {
    try {
      const sessionResponse = await fetch(`/api/sessions/${sessionId}`);
      if (!sessionResponse.ok) throw new Error('Ошибка загрузки сессии');
      
      const { data: sessionData } = await sessionResponse.json();
      setSession(sessionData);

      const courseResponse = await fetch(`/api/courses/${sessionData.courseId}`);
      if (!courseResponse.ok) throw new Error('Ошибка загрузки курса');
      
      const { data: courseData } = await courseResponse.json();
      setCourse(courseData);

      const block = courseData.blocks.find((b: CourseBlock) => b.id === sessionData.currentBlockId);
      setCurrentBlock(block);

      if (block?.questions && block.questions.length > sessionData.currentQuestionIndex) {
        setCurrentQuestion(block.questions[sessionData.currentQuestionIndex]);
      }
    } catch (error) {
      console.error('Error loading session:', error);
      alert('Не удалось загрузить сессию');
      router.push('/learn');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = async () => {
    if (!answer.trim()) return;

    try {
      const response = await fetch(`/api/sessions/${sessionId}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer })
      });

      if (!response.ok) throw new Error('Ошибка отправки ответа');
      
      setAnswer('');
      setShowHint(false);
      await loadSession();
    } catch (error) {
      console.error('Error submitting answer:', error);
      alert('Не удалось отправить ответ');
    }
  };

  const skipQuestion = async () => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}/skip`, {
        method: 'POST'
      });

      if (!response.ok) throw new Error('Ошибка пропуска вопроса');
      
      setAnswer('');
      setShowHint(false);
      await loadSession();
    } catch (error) {
      console.error('Error skipping question:', error);
      alert('Не удалось пропустить вопрос');
    }
  };

  const completeBlock = async () => {
    if (currentBlock?.type === 'reflection') {
      router.push(`/learn/session/${sessionId}/reflection`);
    } else if (currentBlock?.type === 'practice') {
      router.push(`/learn/session/${sessionId}/practice`);
    } else {
      // Переход к следующему блоку
      try {
        const response = await fetch(`/api/sessions/${sessionId}/next-block`, {
          method: 'POST'
        });

        if (!response.ok) throw new Error('Ошибка перехода к следующему блоку');
        
        const { data } = await response.json();
        
        if (data.completed) {
          router.push(`/learn/progress/${session?.courseId}`);
        } else {
          await loadSession();
        }
      } catch (error) {
        console.error('Error moving to next block:', error);
        alert('Не удалось перейти к следующему блоку');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!session || !course || !currentBlock) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Прогресс бар */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>{currentBlock.title}</span>
            <span>{Math.round(session.progress)}% завершено</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${session.progress}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {currentBlock.type === 'introduction' && (
            <div className="prose max-w-none">
              <h2 className="text-2xl font-light text-gray-900 mb-4">Введение</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{currentBlock.content}</p>
              <button
                onClick={completeBlock}
                className="mt-6 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Начать обучение
              </button>
            </div>
          )}

          {currentBlock.type === 'learning' && currentQuestion && (
            <div>
              <h3 className="text-xl font-medium text-gray-900 mb-6">
                {currentQuestion.text}
              </h3>

              {showHint && currentQuestion.hint && (
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700">
                    💡 Подсказка: {currentQuestion.hint}
                  </p>
                </div>
              )}

              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Твой ответ..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={4}
              />

              <div className="mt-6 flex items-center justify-between">
                <button
                  onClick={() => setShowHint(!showHint)}
                  className="text-gray-600 hover:text-gray-800"
                  disabled={!currentQuestion.hint}
                >
                  {showHint ? 'Скрыть подсказку' : 'Показать подсказку'}
                </button>

                <div className="space-x-3">
                  <button
                    onClick={skipQuestion}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Пропустить
                  </button>
                  <button
                    onClick={handleAnswer}
                    disabled={!answer.trim()}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                  >
                    Ответил, продолжить
                  </button>
                </div>
              </div>
            </div>
          )}

          {!currentQuestion && currentBlock.type === 'learning' && (
            <div className="text-center">
              <p className="text-gray-600 mb-6">Все вопросы в этом блоке пройдены!</p>
              <button
                onClick={completeBlock}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Продолжить
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}