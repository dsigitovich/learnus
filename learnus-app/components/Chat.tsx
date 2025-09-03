'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, BookOpen, GraduationCap } from 'lucide-react';
import { useStore } from '@/lib/store';
import { ChatMessage } from '@/lib/types';

export default function Chat() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { messages, addMessage, currentChatId, chats, courses, createCourse, deleteChat } = useStore();
  
  // Получаем информацию о текущем чате и курсе
  const currentChat = currentChatId ? chats.find(c => c.id === currentChatId) : null;
  const currentCourse = currentChat?.courseId ? courses.find(c => c.id === currentChat.courseId) : null;
  const courseProgress = currentChat?.courseProgress;
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const sendMessage = async () => {
    if (!input.trim() || loading || !currentChatId) return;
    
    const userMessage: ChatMessage = {
      role: 'user',
      content: input,
    };
    
    addMessage(userMessage);
    setInput('');
    setLoading(true);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          context: currentCourse ? {
            type: 'course',
            course: currentCourse,
            progress: courseProgress,
          } : undefined,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        // Обработка ошибок API
        if (response.status === 503) {
          addMessage({
            role: 'assistant',
            content: 'OpenAI API ключ не настроен. Пожалуйста, добавьте OPENAI_API_KEY в файл .env.local',
          });
        } else {
          addMessage({
            role: 'assistant',
            content: data.error || 'Произошла ошибка при обработке запроса.',
          });
        }
      } else if (data.data && data.data.reply) {
        addMessage({
          role: 'assistant',
          content: data.data.reply,
        });
        
        // Если в ответе есть данные курса, создаем новый курс
        if (data.data.course) {
          const courseId = createCourse(data.data.course);
          
          // Если это был временный чат для создания курса, удаляем его
          if (currentChat?.type === 'general' && currentChat?.title === 'Создание курса') {
            setTimeout(() => {
              deleteChat(currentChatId);
            }, 100);
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      addMessage({
        role: 'assistant',
        content: 'Извините, произошла ошибка при обработке вашего сообщения.',
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Если нет активного чата
  if (!currentChatId) {
    return (
      <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 items-center justify-center">
        <div className="text-center px-4">
          <BookOpen size={64} className="mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Добро пожаловать в Learnus!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Для начала работы выберите существующий курс в боковой панели
            <br />
            или создайте новый курс, написав в чате "создай курс по..."
          </p>
          <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 text-left">
              Примеры запросов:
            </p>
            <ul className="mt-2 space-y-1 text-sm text-gray-700 dark:text-gray-300 text-left">
              <li>• Создай курс по логике для начинающих</li>
              <li>• Создай курс по программированию на Python</li>
              <li>• Создай курс по математическому анализу</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      {/* Заголовок для курса */}
      {currentCourse && currentChat?.type === 'course' && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800 px-6 py-3">
          <div className="max-w-4xl mx-auto flex items-center gap-3">
            <GraduationCap className="text-blue-600 dark:text-blue-400" size={24} />
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {currentCourse.title}
              </h2>
              {courseProgress && (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Модуль {courseProgress.currentModuleIndex + 1} из {currentCourse.modules.length} • 
                  Урок {courseProgress.currentLessonIndex + 1} из {currentCourse.modules[courseProgress.currentModuleIndex]?.lessons.length || 0}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 pt-20 md:pt-6">
        {messages.length === 0 && (
          <div className="text-center text-gray-600 dark:text-gray-300 mt-20">
            {currentCourse && currentChat?.type === 'course' ? (
              <>
                <BookOpen className="mx-auto text-blue-600 dark:text-blue-400 mb-4" size={64} />
                <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">Добро пожаловать на курс!</h2>
                <p className="text-lg text-gray-700 dark:text-gray-200">Готовы начать обучение?</p>
                <p className="mt-2 text-gray-600 dark:text-gray-300">Напишите "Начать" или задайте вопрос</p>
              </>
            ) : (
              <>
                <h1 className="text-4xl font-bold mb-4 text-gray-800 dark:text-white">Socrademy</h1>
                <p className="text-lg text-gray-700 dark:text-gray-200">Начните обучение с помощью AI</p>
                <p className="mt-2 text-gray-600 dark:text-gray-300">Задайте вопрос, чтобы начать обучение</p>
                <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Или создайте обучающий курс, написав "Создать курс по [тема]"</p>
              </>
            )}
          </div>
        )}
        
        {messages.map((message, index) => (
          <div
            key={index}
            className={`mb-4 ${
              message.role === 'user' ? 'text-right' : 'text-left'
            }`}
          >
            <div
              className={`inline-block max-w-3xl px-4 py-2 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : message.role === 'system'
                  ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 border border-green-300 dark:border-green-700'
                  : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 shadow-sm'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="text-left mb-4">
            <div className="inline-block bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 px-4 py-2 rounded-lg shadow-sm">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex space-x-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Введите сообщение..."
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
