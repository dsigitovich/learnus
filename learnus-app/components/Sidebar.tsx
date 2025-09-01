'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Table, Plus, BookOpen } from 'lucide-react';
import { useProgramStore, useUIStore } from '@/store';
import { LearningProgram } from '@/lib/types';

export default function Sidebar() {
  const { viewMode, setViewMode } = useUIStore();
  const { 
    currentProgram, 
    programs, 
    setPrograms, 
    addProgram, 
    isLoading, 
    setLoading, 
    error, 
    setError 
  } = useProgramStore();
  const [showNewProgram, setShowNewProgram] = useState(false);
  const [newProgramData, setNewProgramData] = useState({ title: '', description: '' });
  
  useEffect(() => {
    fetchPrograms();
  }, []);
  
  const fetchPrograms = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/programs');
      const data = await response.json();
      // API возвращает данные в формате { data: [...] }
      const programsData = data.data || [];
      setPrograms(programsData);
    } catch (error) {
      console.error('Error fetching programs:', error);
      setPrograms([]);
    } finally {
      setLoading(false);
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
        const result = await response.json();
        // API возвращает данные в формате { data: {...} }
        const program = result.data || result;
        addProgram(program);
        // Загружаем новую программу как текущую
        const { setCurrentProgram, setNodes } = useProgramStore.getState();
        setCurrentProgram(program);
        setNodes([]); // Новая программа пока не имеет узлов
        setShowNewProgram(false);
        setNewProgramData({ title: '', description: '' });
      }
    } catch (error) {
      console.error('Error creating program:', error);
    }
  };
  
  const selectProgram = async (program: LearningProgram) => {
    try {
      // Загружаем узлы программы через API
      const response = await fetch(`/api/programs/${program.id}/nodes`);
      if (response.ok) {
        const data = await response.json();
        // Обновляем текущую программу и её узлы в store
        const { setCurrentProgram, setNodes } = useProgramStore.getState();
        setCurrentProgram(program);
        setNodes(data.data || []);
      }
    } catch (error) {
      console.error('Error loading program:', error);
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
            onClick={() => setViewMode('table')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
              viewMode === 'table' ? 'bg-gray-800' : 'hover:bg-gray-800'
            }`}
          >
            <Table size={20} />
            <span>Таблица тем</span>
          </button>
        </div>
      </div>
      
      {/* Programs */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-400">Программы</h3>
          <button
            onClick={() => setShowNewProgram(true)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <Plus size={16} />
          </button>
        </div>
        
        <div className="space-y-2">
          {isLoading ? (
            <div className="text-gray-400 text-sm py-2 text-center">
              Загрузка...
            </div>
          ) : programs && programs.length > 0 ? (
            programs.map((program) => (
              <button
                key={program.id}
                onClick={() => selectProgram(program)}
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
            ))
          ) : (
            <div className="text-gray-400 text-sm py-2 text-center">
              Нет программ
            </div>
          )}
        </div>
      </div>
      
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
