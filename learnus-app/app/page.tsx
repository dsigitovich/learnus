'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Chat from '@/components/Chat';
import Sidebar from '@/components/Sidebar';

export default function Home() {
  const router = useRouter();
  const [mode, setMode] = useState<'chat' | 'learn' | null>(null);
  
  useEffect(() => {
    // Инициализация базы данных при первой загрузке
    fetch('/api/init')
      .then(res => res.json())
      .then(data => console.log('Database initialized:', data))
      .catch(err => console.error('Failed to initialize database:', err));
  }, []);
  
  if (mode === 'chat') {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1">
          <Chat />
        </div>
      </div>
    );
  }
  
  if (mode === 'learn') {
    router.push('/learn');
    return null;
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-4xl w-full mx-auto p-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-light text-gray-900 mb-4">LearnUS</h1>
          <p className="text-lg text-gray-600">Выбери, как ты хочешь учиться сегодня</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          <button
            onClick={() => setMode('chat')}
            className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left"
          >
            <div className="text-3xl mb-4">💬</div>
            <h2 className="text-2xl font-light text-gray-900 mb-2">Чат с ИИ</h2>
            <p className="text-gray-600">
              Свободное общение с искусственным интеллектом. Задавай любые вопросы и получай ответы.
            </p>
          </button>
          
          <button
            onClick={() => setMode('learn')}
            className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left"
          >
            <div className="text-3xl mb-4">🎯</div>
            <h2 className="text-2xl font-light text-gray-900 mb-2">Структурированное обучение</h2>
            <p className="text-gray-600">
              Создай персональный курс по любой теме с вопросами, практикой и рефлексией.
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}
