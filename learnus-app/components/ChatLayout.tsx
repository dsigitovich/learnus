'use client';

import { useState } from 'react';
import Sidebar from './Sidebar';
import Chat from './Chat';
import CourseView from './CourseView';
import { useStore } from '@/lib/store';

export default function ChatLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentCourseId, courses, createCourseChat, chats, currentChatId } = useStore();
  
  // Проверяем, есть ли выбранный курс и нет ли активного чата
  const selectedCourse = currentCourseId ? courses.find(c => c.id === currentCourseId) : null;
  const currentChat = currentChatId ? chats.find(c => c.id === currentChatId) : null;
  const showCourseView = selectedCourse && (!currentChat || currentChat.courseId !== currentCourseId);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className={`flex-1 transition-all duration-300 ${
        sidebarOpen ? 'md:ml-0' : 'ml-0'
      }`}>
        {showCourseView && selectedCourse ? (
          <CourseView 
            course={selectedCourse} 
            onStartLearning={() => createCourseChat(selectedCourse.id)}
          />
        ) : (
          <Chat />
        )}
      </div>
    </div>
  );
}