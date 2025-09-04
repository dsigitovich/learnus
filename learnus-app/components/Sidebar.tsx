'use client';

import { useState, useEffect } from 'react';
import { Menu, X, Trash2, BookOpen, ChevronRight, ChevronDown } from 'lucide-react';
import { useStore } from '@/lib/store';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const { 
    chats, 
    currentChatId, 
    selectChat, 
    courses,
    currentCourseId,
    selectCourse,
    deleteCourse,
    createCourseChat
  } = useStore();
  const [isMobile, setIsMobile] = useState(false);
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set());

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
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <BookOpen size={20} />
                Мои курсы
              </h2>
              
              {/* Кнопка закрытия сайдбара в правом верхнем углу */}
              <button
                onClick={onToggle}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Закрыть сайдбар"
              >
                <X size={20} />
              </button>
            </div>
          </div>

                      {/* Content */}
            <div className="flex-1 overflow-y-auto p-2 sidebar-scrollbar">
              {/* Список курсов */}
              <div className="space-y-2">
                {courses.map((course) => {
                  const isExpanded = expandedCourses.has(course.id);
                  const courseChats = chats.filter(chat => chat.courseId === course.id);
                  
                  return (
                    <div key={course.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                      <div
                        className={`group flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors ${
                          currentCourseId === course.id && currentChatId === courseChats[0]?.id
                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                        onClick={() => {
                          selectCourse(course.id);
                          toggleCourseExpansion(course.id);
                          // Автоматически открываем чат курса
                          if (courseChats.length > 0 && courseChats[0]) {
                            selectChat(courseChats[0].id);
                          } else {
                            createCourseChat(course.id);
                          }
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
                        {courseChats.length === 0 && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Новый
                          </span>
                        )}
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
                          
                          {/* Статус обучения */}
                          {courseChats.length > 0 && courseChats[0] && courseChats[0].courseProgress && (
                            <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                              <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Прогресс обучения:</div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">
                                Модуль {courseChats[0].courseProgress.currentModuleIndex + 1} из {course.modules.length},
                                Урок {courseChats[0].courseProgress.currentLessonIndex + 1} из {course.modules[courseChats[0].courseProgress.currentModuleIndex]?.lessons.length || 0}
                              </div>
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
                    Напишите в чате "создай курс по..."
                  </div>
                )}
              </div>
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