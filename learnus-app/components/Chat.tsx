'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Brain } from 'lucide-react';
import { useStore } from '@/lib/store';
import { ChatMessage } from '@/lib/types';

export default function Chat() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [thoughts, setThoughts] = useState<string[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  
  const { 
    currentChatId, 
    chats, 
    addMessage, 
    currentCourse, 
    courseProgress,
    createCourse
  } = useStore();
  
  const messages = chats[currentChatId]?.messages || [];
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage, thoughts]);
  
  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    
    const userMessage: ChatMessage = {
      role: 'user',
      content: input,
    };
    
    addMessage(userMessage);
    setInput('');
    setLoading(true);
    setStreamingMessage('');
    setThoughts([]);
    setIsThinking(false);
    
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
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Обрабатываем Server-Sent Events
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      if (!reader) {
        throw new Error('No response body');
      }
      
      let buffer = '';
      let fullMessage = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        
        let i = 0;
        while (i < lines.length) {
          const line = lines[i];
          if (line.startsWith('event:')) {
            const event = line.slice(6).trim();
            
            // Получаем следующую строку с данными
            if (i + 1 < lines.length && lines[i + 1].startsWith('data:')) {
              const data = lines[i + 1].slice(5).trim();
              i += 2; // Пропускаем обе строки
              
              try {
                const parsedData = JSON.parse(data);
                
                switch (event) {
                  case 'thought':
                    setIsThinking(true);
                    setThoughts(prev => [...prev, parsedData.content]);
                    break;
                    
                  case 'content':
                    setIsThinking(false);
                    fullMessage += parsedData.content;
                    setStreamingMessage(fullMessage);
                    break;
                    
                  case 'course':
                    if (parsedData.course) {
                      const courseId = createCourse(parsedData.course);
                      addMessage({
                        role: 'system',
                        content: `✅ Курс "${parsedData.course.title}" успешно создан! Вы можете найти его в разделе "Курсы" в боковой панели.`,
                      });
                    }
                    break;
                    
                  case 'done':
                    if (parsedData.reply) {
                      addMessage({
                        role: 'assistant',
                        content: parsedData.reply,
                      });
                    }
                    break;
                    
                  case 'error':
                    console.error('Stream error:', parsedData);
                    if (parsedData.statusCode === 503) {
                      addMessage({
                        role: 'assistant',
                        content: 'OpenAI API ключ не настроен. Пожалуйста, добавьте OPENAI_API_KEY в файл .env.local',
                      });
                    } else {
                      addMessage({
                        role: 'assistant',
                        content: parsedData.error || 'Произошла ошибка при обработке запроса.',
                      });
                    }
                    break;
                }
              } catch (error) {
                console.error('Failed to parse SSE data:', error);
              }
            } else {
              i++; // Если нет данных, переходим к следующей строке
            }
          } else {
            i++; // Если это не событие, переходим к следующей строке
          }
        }
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
      addMessage({
        role: 'assistant',
        content: 'Произошла ошибка при отправке сообщения. Пожалуйста, попробуйте снова.',
      });
    } finally {
      setLoading(false);
      setStreamingMessage('');
      setThoughts([]);
      setIsThinking(false);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[70%] p-4 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : message.role === 'system'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                  : 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100'
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}
        
        {/* Thoughts Display */}
        {thoughts.length > 0 && (
          <div className="flex justify-start">
            <div className="max-w-[70%] space-y-2">
              {thoughts.map((thought, index) => (
                <div
                  key={index}
                  className="p-3 rounded-lg bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100 flex items-start gap-2 thought-appear thinking-animation"
                >
                  <Brain className="w-5 h-5 mt-0.5 flex-shrink-0 animate-pulse" />
                  <p className="text-sm italic">{thought}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Streaming Message */}
        {streamingMessage && (
          <div className="flex justify-start">
            <div className="max-w-[70%] p-4 rounded-lg bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100">
              <p className="whitespace-pre-wrap">{streamingMessage}</p>
            </div>
          </div>
        )}
        
        {/* Thinking Indicator */}
        {isThinking && (
          <div className="flex justify-start">
            <div className="p-3 rounded-lg bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100 flex items-center gap-3 thinking-animation">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-purple-600 dark:bg-purple-400 rounded-full typing-dot"></div>
                <div className="w-2 h-2 bg-purple-600 dark:bg-purple-400 rounded-full typing-dot"></div>
                <div className="w-2 h-2 bg-purple-600 dark:bg-purple-400 rounded-full typing-dot"></div>
              </div>
              <span className="text-sm font-medium">Анализирую и создаю структуру курса...</span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input Area */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Введите сообщение..."
            className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            rows={3}
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}