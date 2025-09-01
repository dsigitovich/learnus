'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, GitBranch, Plus, BookOpen, Sparkles } from 'lucide-react';
import { useStore } from '@/lib/store';
import { LearningProgram } from '@/lib/types';
import ProgramGenerator from './ProgramGenerator';

export default function Sidebar() {
  const { viewMode, setViewMode, currentProgram, setCurrentProgram } = useStore();
  const [programs, setPrograms] = useState<LearningProgram[]>([]);
  const [showNewProgram, setShowNewProgram] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);
  const [newProgramData, setNewProgramData] = useState({ title: '', description: '' });
  
  useEffect(() => {
    fetchPrograms();
  }, []);
  
  const fetchPrograms = async () => {
    try {
      const response = await fetch('/api/programs');
      const data = await response.json();
      setPrograms(data);
    } catch (error) {
      console.error('Error fetching programs:', error);
    }
  };
  
  const createProgram = async () => {
    if (!newProgramData.title) return;
    
    try {
      const response = await fetch('/api/programs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProgramData),
      });
      
      if (response.ok) {
        const program = await response.json();
        setPrograms([program, ...programs]);
        setCurrentProgram(program);
        setShowNewProgram(false);
        setNewProgramData({ title: '', description: '' });
      }
    } catch (error) {
      console.error('Error creating program:', error);
    }
  };
  
  return (
    <div className="w-64 bg-gray-900 text-white h-screen flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-gray-800">
        <h1 className="text-xl font-bold">Learnus</h1>
      </div>
      
      {/* View Mode Toggle */}
      <div className="p-4 border-b border-gray-800">
        <div className="space-y-2">
          <button
            onClick={() => setViewMode('chat')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
              viewMode === 'chat' ? 'bg-gray-800' : 'hover:bg-gray-800'
            }`}
          >
            <MessageSquare size={20} />
            <span>Чат</span>
          </button>
          <button
            onClick={() => setViewMode('tree')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
              viewMode === 'tree' ? 'bg-gray-800' : 'hover:bg-gray-800'
            }`}
          >
            <GitBranch size={20} />
            <span>Дерево программы</span>
          </button>
        </div>
      </div>
      
      {/* Programs */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-400">Программы</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowGenerator(true)}
              className="text-purple-400 hover:text-purple-300 transition-colors"
              title="Создать с AI"
            >
              <Sparkles size={16} />
            </button>
            <button
              onClick={() => setShowNewProgram(true)}
              className="text-gray-400 hover:text-white transition-colors"
              title="Создать вручную"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
        
        <div className="space-y-2">
          {programs.map((program) => (
            <button
              key={program.id}
              onClick={() => setCurrentProgram(program)}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                currentProgram?.id === program.id
                  ? 'bg-gray-800'
                  : 'hover:bg-gray-800'
              }`}
            >
              <div className="flex items-center space-x-2">
                <BookOpen size={16} />
                <div className="flex-1 min-w-0">
                  <div className="truncate">{program.title}</div>
                  {program.description && (
                    <div className="text-xs text-gray-400 truncate">
                      {program.description}
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
      
      {/* Program Generator */}
      {showGenerator && (
        <ProgramGenerator
          onClose={() => setShowGenerator(false)}
          onProgramCreated={(program) => {
            fetchPrograms();
            setCurrentProgram(program);
          }}
        />
      )}
      
      {/* New Program Dialog */}
      {showNewProgram && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white text-gray-900 rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Создать новую программу</h3>
            <input
              type="text"
              placeholder="Название программы"
              value={newProgramData.title}
              onChange={(e) => setNewProgramData({ ...newProgramData, title: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <textarea
              placeholder="Описание (необязательно)"
              value={newProgramData.description}
              onChange={(e) => setNewProgramData({ ...newProgramData, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowNewProgram(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Отмена
              </button>
              <button
                onClick={createProgram}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Создать
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
