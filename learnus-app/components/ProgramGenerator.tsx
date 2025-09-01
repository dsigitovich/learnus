'use client';

import { useState } from 'react';
import { Sparkles, Loader2, X } from 'lucide-react';
import { useStore } from '@/lib/store';
import { LearningProgram, ProgramNode } from '@/lib/types';

interface ProgramGeneratorProps {
  onClose: () => void;
  onProgramCreated: (program: LearningProgram) => void;
}

export default function ProgramGenerator({ onClose, onProgramCreated }: ProgramGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const { setCurrentProgram, setNodes } = useStore();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Пожалуйста, введите описание учебной программы');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      const response = await fetch('/api/programs/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error('Ошибка при генерации программы');
      }

      const data = await response.json();
      
      // Обновляем store
      setCurrentProgram(data.program);
      
      // Преобразуем узлы для store
      const transformedNodes: ProgramNode[] = data.nodes.map((node: any) => ({
        id: node.id.toString(),
        program_id: node.program_id,
        parent_id: node.parent_id,
        title: node.title,
        description: node.description,
        content: node.content,
        position: {
          x: node.position_x,
          y: node.position_y,
        },
        status: node.status,
        created_at: node.created_at,
      }));
      
      setNodes(transformedNodes);
      onProgramCreated(data.program);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setIsGenerating(false);
    }
  };

  const examplePrompts = [
    "Создай программу изучения веб-разработки с нуля до junior уровня",
    "Разработай курс по изучению машинного обучения для начинающих",
    "Составь план изучения английского языка от A1 до B2",
    "Создай программу подготовки к собеседованию на позицию frontend разработчика",
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Sparkles className="w-6 h-6 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-800">
                Создание учебной программы с AI
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Опишите, какую учебную программу вы хотите создать
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Например: Создай детальную программу изучения Python для начинающих с упором на веб-разработку"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              rows={4}
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Примеры запросов:
            </h3>
            <div className="space-y-2">
              {examplePrompts.map((example, index) => (
                <button
                  key={index}
                  onClick={() => setPrompt(example)}
                  className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition-colors"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Совет:</strong> Чем подробнее вы опишете свои цели и уровень знаний, 
              тем более персонализированную программу создаст AI. Укажите желаемую 
              продолжительность обучения, предпочтительный стиль и конкретные темы.
            </p>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              disabled={isGenerating}
              className="px-6 py-2 text-gray-700 hover:text-gray-900 transition-colors disabled:opacity-50"
            >
              Отмена
            </button>
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Генерация...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Создать программу</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}