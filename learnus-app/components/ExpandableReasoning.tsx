'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Brain } from 'lucide-react';
import { AIReasoningStep } from '@/lib/types';

interface ExpandableReasoningProps {
  reasoning: AIReasoningStep[];
}

export default function ExpandableReasoning({ reasoning }: ExpandableReasoningProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!reasoning || reasoning.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 border-t border-gray-200 dark:border-gray-600 pt-3">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors group w-full justify-start"
      >
        <Brain size={16} className="text-blue-500 dark:text-blue-400" />
        <span className="font-medium">Показать, как ИИ размышлял</span>
        <span className="text-xs text-gray-500 dark:text-gray-500 ml-1">({reasoning.length} шагов)</span>
        {isExpanded ? (
          <ChevronDown size={16} className="group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors ml-auto" />
        ) : (
          <ChevronRight size={16} className="group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors ml-auto" />
        )}
      </button>
      
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
        isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="mt-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
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
    </div>
  );
}