'use client';

import { Brain } from 'lucide-react';
import { AIReasoningStep } from '@/lib/types';

interface InlineReasoningProps {
  reasoning: AIReasoningStep[];
}

export default function InlineReasoning({ reasoning }: InlineReasoningProps) {
  if (!reasoning || reasoning.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 border-t border-gray-200 dark:border-gray-600 pt-3">
      <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
          <Brain size={14} className="text-blue-500 dark:text-blue-400" />
          Процесс рассуждений ИИ:
        </h4>
        <div className="space-y-2">
          {reasoning.map((step, index) => (
            <div key={step.id} className="flex items-start gap-3 animate-fadeIn hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-md p-2 -m-2 transition-colors" style={{
              animationDelay: `${index * 100}ms`
            }}>
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-medium">
                {index + 1}
              </div>
              <div className="flex items-center gap-2 flex-1">
                {step.emoji && (
                  <span className="text-sm">{step.emoji}</span>
                )}
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {step.description}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
