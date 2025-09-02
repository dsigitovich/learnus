'use client';

import { useState, useEffect } from 'react';
import { Plus, MessageSquare, Menu, X, Trash2 } from 'lucide-react';
import { useStore } from '@/lib/store';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const { chats, currentChatId, createNewChat, selectChat, deleteChat } = useStore();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

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
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
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

          {/* Chats list */}
          <div className="flex-1 overflow-y-auto p-2 sidebar-scrollbar">
            {chats.map((chat) => (
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
            ))}
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