'use client';

import { useState, useEffect } from 'react';
import { Plus, MessageSquare, Menu, X, Trash2, BookOpen, ChevronRight, ChevronDown, Play } from 'lucide-react';
import { useStore } from '@/lib/store';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const { 
    chats, 
    currentChatId, 
    createNewChat, 
    selectChat, 
    deleteChat,
    courses,
    currentCourseId,
    selectCourse,
    deleteCourse,
    createCourseChat
  } = useStore();
  const [isMobile, setIsMobile] = useState(false);
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'chats' | 'courses'>('chats');

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const toggleCourseExpansion = (courseId: string) => {
    setExpandedCourses(prev => {
      const newSet = new Set(prev);
      if (newSet.has(courseId)) {
        newSet.delete(courseId);
      } else {
        newSet.add(courseId);
      }
      return newSet;
    });
  };

  return (
    <>
      {/* Overlay для мобильных устройств */}
      {isOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed md:relative z-50 h-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ${
          isOpen ? 'w-64' : 'w-0 md:w-0'
        } overflow-hidden`}
      >
        <div className="flex flex-col h-full w-64">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={createNewChat}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 rounded-lg transition-colors"
              >
                <Plus size={20} />
                <span>Новый чат</span>
              </button>
              
              {/* Кнопка закрытия сайдбара в правом верхнем углу */}
              <button
                onClick={onToggle}
                className="ml-2 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Закрыть сайдбар"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Вкладки */}
            <div className="flex rounded-lg bg-gray-100 dark:bg-gray-700 p-1">
              <button
                onClick={() => setActiveTab('chats')}
                className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'chats'
                    ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                Чаты
              </button>
              <button
                onClick={() => setActiveTab('courses')}
                className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'courses'
                    ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                Курсы
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-2 sidebar-scrollbar">
            {activeTab === 'chats' ? (
              // Список чатов
              chats.filter(chat => chat.type === 'general').map((chat) => (
                <div
                  key={chat.id}
                  className={`group flex items-center gap-2 px-3 py-2 mb-1 rounded-lg cursor-pointer transition-colors ${
                    currentChatId === chat.id
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => selectChat(chat.id)}
                >
                  <MessageSquare size={18} className="flex-shrink-0" />
                  <span className="flex-1 truncate text-sm">
                    {chat.title || 'Новый чат'}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteChat(chat.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            ) : (
              // Список курсов
              <div className="space-y-2">
                {courses.map((course) => {
                  const isExpanded = expandedCourses.has(course.id);
                  const courseChats = chats.filter(chat => chat.courseId === course.id);
                  
                  return (
                    <div key={course.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                      <div
                        className={`group flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors ${
                          currentCourseId === course.id
                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                        onClick={() => {
                          selectCourse(course.id);
                          toggleCourseExpansion(course.id);
                        }}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleCourseExpansion(course.id);
                          }}
                          className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                        >
                          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </button>
                        <BookOpen size={18} className="flex-shrink-0" />
                        <span className="flex-1 truncate text-sm font-medium">
                          {course.title}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            createCourseChat(course.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-all"
                          title="Начать обучение"
                        >
                          <Play size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteCourse(course.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      
                      {isExpanded && (
                        <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{course.description}</p>
                          <div className="text-xs text-gray-500 dark:text-gray-500 mb-2">
                            Уровень: {course.level === 'Beginner' ? 'Начинающий' : course.level === 'Intermediate' ? 'Средний' : 'Продвинутый'}
                          </div>
                          
                          {/* Модули курса */}
                          <div className="space-y-1 mt-3">
                            <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Модули:</div>
                            {course.modules.map((module, moduleIndex) => (
                              <div key={moduleIndex} className="pl-2">
                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                  {moduleIndex + 1}. {module.title}
                                </div>
                                <div className="pl-3 space-y-0.5">
                                  {module.lessons.map((lesson, lessonIndex) => (
                                    <div key={lessonIndex} className="text-xs text-gray-500 dark:text-gray-500">
                                      • {lesson.title}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          {/* Активные чаты курса */}
                          {courseChats.length > 0 && (
                            <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                              <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Активные сессии:</div>
                              {courseChats.map((chat) => (
                                <div
                                  key={chat.id}
                                  className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer text-xs ${
                                    currentChatId === chat.id
                                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                                  }`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    selectChat(chat.id);
                                  }}
                                >
                                  <MessageSquare size={14} />
                                  <span className="flex-1 truncate">{chat.title}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
                
                {courses.length === 0 && (
                  <div className="text-center text-sm text-gray-500 dark:text-gray-400 py-8">
                    Нет созданных курсов.
                    <br />
                    Создайте курс в чате с AI!
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Learnus AI Assistant
            </div>
          </div>
        </div>
      </div>

      {/* Toggle button - только для мобильных устройств */}
      <button
        onClick={onToggle}
        className={`fixed top-4 left-4 z-50 p-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-all duration-300 md:hidden`}
      >
        <Menu size={20} />
      </button>

      {/* Desktop toggle button - только когда сайдбар закрыт */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="hidden md:block fixed top-4 left-4 z-40 p-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-all duration-300"
        >
          <Menu size={20} />
        </button>
      )}
    </>
  );
}