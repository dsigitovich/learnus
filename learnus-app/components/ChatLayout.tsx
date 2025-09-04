'use client';

import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Chat from './Chat';
import CourseView from './CourseView';
import { useStore } from '@/lib/store';
import { useSwipeGestures } from '@/hooks/useSwipeGestures';
import { useWindowSize } from '@/hooks/useWindowSize';

export default function ChatLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showSwipeIndicator, setShowSwipeIndicator] = useState(false);
  const { currentCourseId, courses, createCourseChat, chats, currentChatId } = useStore();
  const { isMobile, isDesktop } = useWindowSize(100); // Debounce на 100ms для лучшей производительности
  
  // Автоматическое управление сайдбаром в зависимости от размера экрана
  useEffect(() => {
    // На десктопе автоматически открываем сайдбар, на мобильном закрываем
    if (isDesktop && !sidebarOpen) {
      setSidebarOpen(true);
    } else if (isMobile && sidebarOpen) {
      setSidebarOpen(false);
    }
  }, [isMobile, isDesktop, sidebarOpen]);

  // Показываем индикатор свайпа на мобильном
  useEffect(() => {
    if (isMobile && !sidebarOpen) {
      const timer = setTimeout(() => {
        setShowSwipeIndicator(true);
        // Скрываем индикатор через 3 секунды
        setTimeout(() => setShowSwipeIndicator(false), 3000);
      }, 2000); // Показываем через 2 секунды после загрузки

      return () => clearTimeout(timer);
    }
  }, [isMobile, sidebarOpen]);

  // Проверяем, есть ли выбранный курс и нет ли активного чата
  const selectedCourse = currentCourseId ? courses.find(c => c.id === currentCourseId) : null;
  const currentChat = currentChatId ? chats.find(c => c.id === currentChatId) : null;
  const showCourseView = selectedCourse && (!currentChat || currentChat.courseId !== currentCourseId);

  // Обработка swipe жестов для мобильной навигации
  useSwipeGestures({
    onSwipeRight: () => {
      if (isMobile && !sidebarOpen) {
        setSidebarOpen(true);
        setShowSwipeIndicator(false);
      }
    },
    onSwipeLeft: () => {
      if (isMobile && sidebarOpen) {
        setSidebarOpen(false);
      }
    },
    threshold: 80, // Увеличиваем threshold для предотвращения случайных срабатываний
  });

  // Закрываем сайдбар на мобильном при выборе курса/чата
  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleCourseSelect = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Индикатор свайпа для мобильных устройств */}
      {isMobile && showSwipeIndicator && (
        <div className="swipe-indicator visible">
          <div className="absolute left-1 top-1/2 transform -translate-y-1/2 text-blue-600">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
            </svg>
          </div>
        </div>
      )}
      
      <Sidebar 
        isOpen={sidebarOpen} 
        onToggle={handleSidebarToggle}
        onCourseSelect={handleCourseSelect}
      />
      
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
        sidebarOpen && !isMobile ? 'md:ml-64' : 'ml-0'
      }`}>
        <div className="flex-1 overflow-hidden">
          {showCourseView && selectedCourse ? (
            <CourseView 
              course={selectedCourse} 
              onStartLearning={() => {
                createCourseChat(selectedCourse.id);
                if (isMobile) setSidebarOpen(false);
              }}
            />
          ) : (
            <Chat />
          )}
        </div>
      </div>
    </div>
  );
}