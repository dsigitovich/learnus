'use client';

import { useState } from 'react';
import { CourseProgressTodo, ProgressTodoItem } from '@/lib/types';
import { 
  CheckCircle, 
  Circle, 
  Lock, 
  BookOpen, 
  FileText, 
  Award,
  X,
  RefreshCw
} from 'lucide-react';

interface ProgressTodoListProps {
  progressTodo: CourseProgressTodo;
  onMarkCompleted: (itemId: string) => void;
  onMarkIncomplete: (itemId: string) => void;
  onRefresh: () => void;
  isLoading?: boolean;
  onClose?: () => void;
}

export default function ProgressTodoList({
  progressTodo,
  onMarkCompleted,
  onMarkIncomplete,
  onRefresh,
  isLoading = false,
  onClose
}: ProgressTodoListProps) {
  const [filter, setFilter] = useState<'all' | 'available' | 'completed'>('all');

  const filteredItems = progressTodo.items.filter(item => {
    switch (filter) {
      case 'available':
        return item.isAvailable;
      case 'completed':
        return item.isCompleted;
      default:
        return true;
    }
  });

  const getItemIcon = (item: ProgressTodoItem) => {
    if (!item.isAvailable) return <Lock size={16} className="text-gray-400" />;
    if (item.isCompleted) return <CheckCircle size={16} className="text-green-600" />;
    return <Circle size={16} className="text-gray-400" />;
  };

  const getTypeIcon = (type: ProgressTodoItem['type']) => {
    switch (type) {
      case 'lesson':
        return <BookOpen size={14} className="text-blue-600" />;
      case 'module_quiz':
        return <FileText size={14} className="text-purple-600" />;
      case 'final_assessment':
        return <Award size={14} className="text-orange-600" />;
      default:
        return <Circle size={14} />;
    }
  };

  const handleItemClick = (item: ProgressTodoItem) => {
    if (!item.isAvailable) return;
    
    if (item.isCompleted) {
      onMarkIncomplete(item.id);
    } else {
      onMarkCompleted(item.id);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <Award className="text-blue-600 dark:text-blue-400" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Прогресс курса
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {progressTodo.completedItems} из {progressTodo.totalItems} выполнено ({progressTodo.progressPercentage}%)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50"
            >
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700">
          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressTodo.progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Filters */}
        <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex gap-2">
            {[
              { key: 'all', label: 'Все' },
              { key: 'available', label: 'Доступные' },
              { key: 'completed', label: 'Выполненные' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key as typeof filter)}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  filter === key
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-600'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Todo List */}
        <div className="overflow-y-auto max-h-96">
          {filteredItems.length === 0 ? (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              Нет элементов для отображения
            </div>
          ) : (
            <div className="p-4 space-y-2">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    item.isAvailable
                      ? 'hover:bg-gray-50 dark:hover:bg-gray-700'
                      : 'opacity-50 cursor-not-allowed'
                  } ${
                    item.isCompleted
                      ? 'bg-green-50 dark:bg-green-900/20'
                      : ''
                  }`}
                >
                  <div className="flex-shrink-0">
                    {getItemIcon(item)}
                  </div>
                  
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {getTypeIcon(item.type)}
                    <span className={`text-sm font-medium truncate ${
                      item.isCompleted
                        ? 'line-through text-gray-500 dark:text-gray-400'
                        : 'text-gray-900 dark:text-gray-100'
                    }`}>
                      {item.title}
                    </span>
                  </div>

                  {item.type === 'lesson' && item.lessonIndex !== undefined && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded">
                      Урок {item.lessonIndex + 1}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>
              Модуль {progressTodo.items[0]?.moduleIndex !== undefined ? progressTodo.items[0].moduleIndex + 1 : 1}
            </span>
            <span>
              {progressTodo.completedItems}/{progressTodo.totalItems} выполнено
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}