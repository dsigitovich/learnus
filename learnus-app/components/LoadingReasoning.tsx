'use client';

import { Brain } from 'lucide-react';

export default function LoadingReasoning() {
  const loadingSteps = [
    {
      id: 'loading1',
      description: 'Анализирую ваш запрос...',
      emoji: '🔍'
    },
    {
      id: 'loading2',
      description: 'Формулирую ответ...',
      emoji: '💭'
    },
    {
      id: 'loading3',
      description: 'Проверяю контекст...',
      emoji: '🎯'
    }
  ];

  return (
    <div className="text-left mb-4">
      <div className="inline-block bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 px-4 py-2 rounded-lg shadow-sm">
        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
            <Brain size={14} className="text-blue-500 dark:text-blue-400" />
            ИИ размышляет:
          </h4>
          <div className="space-y-2">
            {loadingSteps.map((step, index) => (
              <div key={step.id} className="flex items-start gap-3 animate-pulse" style={{
                animationDelay: `${index * 200}ms`
              }}>
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-medium">
                  {index + 1}
                </div>
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-sm">{step.emoji}</span>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {step.description}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
