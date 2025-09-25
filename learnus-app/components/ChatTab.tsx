'use client';

import { useState, useEffect, useRef } from 'react';
import { PaperAirplaneIcon, UserIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: string;
}

interface ChatTabProps {
  courseId: string;
  courseTitle?: string;
  currentLessonId?: string;
}

export default function ChatTab({ courseId, courseTitle, currentLessonId }: ChatTabProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchChatHistory();
  }, [courseId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChatHistory = async () => {
    try {
      const response = await fetch(`/api/courses/${courseId}/chat`);
      const data = await response.json();
      
      if (data.success && data.messages) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Error fetching chat history:', error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputMessage.trim(),
      isUser: true,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch(`/api/courses/${courseId}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          lessonId: currentLessonId,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: data.response,
          isUser: false,
          timestamp: new Date().toISOString(),
        };
        
        setMessages(prev => [...prev, aiMessage]);
      } else {
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: 'Извините, произошла ошибка. Попробуйте еще раз.',
          isUser: false,
          timestamp: new Date().toISOString(),
        };
        
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: 'Извините, произошла ошибка. Попробуйте еще раз.',
        isUser: false,
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center space-x-3">
          <ChatBubbleLeftRightIcon className="w-6 h-6 text-blue-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Чат с ИИ-помощником
            </h3>
            <p className="text-sm text-gray-600">
              {courseTitle ? `Курс: ${courseTitle}` : 'Задавайте вопросы по курсу'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <ChatBubbleLeftRightIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              Начните общение с ИИ-помощником
            </h4>
            <p className="text-gray-600">
              Задавайте вопросы по курсу, просите объяснения или советы по изучению материала.
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.isUser
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <div className="flex items-start space-x-2">
                  {!message.isUser && (
                    <div className="flex-shrink-0">
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white font-bold">AI</span>
                      </div>
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.isUser ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                  {message.isUser && (
                    <div className="flex-shrink-0">
                      <UserIcon className="w-6 h-6 text-blue-100" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-gray-100 text-gray-900">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-bold">AI</span>
                </div>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <form onSubmit={sendMessage} className="flex space-x-4">
          <div className="flex-1">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Задайте вопрос по курсу..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <PaperAirplaneIcon className="w-4 h-4" />
            <span>Отправить</span>
          </button>
        </form>
      </div>
    </div>
  );
}