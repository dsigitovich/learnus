'use client';

import { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  Clock, 
  PlayCircle, 
  PauseCircle,
  BarChart3,
  Calendar,
  Target,
  StickyNote,
  Save
} from 'lucide-react';
import { ProgramNode, NodeProgress } from '@/lib/types';
import { useStore } from '@/lib/store';

interface NodeProgressPanelProps {
  node: ProgramNode;
  onClose?: () => void;
}

export default function NodeProgressPanel({ node, onClose }: NodeProgressPanelProps) {
  const { currentProgram, updateNode } = useStore();
  const [progress, setProgress] = useState<NodeProgress | null>(null);
  const [percentage, setPercentage] = useState(0);
  const [notes, setNotes] = useState('');
  const [timeSpent, setTimeSpent] = useState(0);
  const [isLearning, setIsLearning] = useState(false);
  const [sessionStart, setSessionStart] = useState<Date | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProgress();
  }, [node.id]);

  const fetchProgress = async () => {
    try {
      const response = await fetch(`/api/nodes/${node.id}/progress`);
      const data = await response.json();
      
      if (data.progress) {
        setProgress(data.progress);
        setPercentage(data.progress.percentage || 0);
        setNotes(data.progress.notes || '');
        setTimeSpent(data.stats?.total_time_spent || 0);
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  };

  const startLearning = async () => {
    setIsLearning(true);
    setSessionStart(new Date());
    
    // Сохраняем текущую позицию
    if (currentProgram) {
      await fetch(`/api/programs/${currentProgram.id}/position`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ node_id: node.id }),
      });
    }
    
    // Обновляем статус на "в процессе"
    if (node.status === 'not_started') {
      await updateProgress('in_progress', percentage);
    }
  };

  const pauseLearning = () => {
    setIsLearning(false);
    if (sessionStart) {
      const sessionMinutes = Math.round((new Date().getTime() - sessionStart.getTime()) / 60000);
      setTimeSpent(prev => prev + sessionMinutes);
      setSessionStart(null);
    }
  };

  const updateProgress = async (status: string, currentPercentage?: number) => {
    setSaving(true);
    try {
      await fetch(`/api/nodes/${node.id}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status, 
          notes: notes || undefined,
          percentage: currentPercentage !== undefined ? currentPercentage : percentage
        }),
      });
      
      updateNode(node.id, { status: status as any });
      await fetchProgress();
    } catch (error) {
      console.error('Error updating progress:', error);
    } finally {
      setSaving(false);
    }
  };

  const handlePercentageChange = (value: number) => {
    setPercentage(value);
    if (value === 100) {
      updateProgress('completed', 100);
    } else if (value > 0 && node.status === 'not_started') {
      updateProgress('in_progress', value);
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}ч ${mins}м`;
    }
    return `${mins}м`;
  };

  const getStatusBadge = () => {
    const badges = {
      completed: (
        <div className="flex items-center space-x-2 text-green-700 bg-green-100 px-3 py-1 rounded-full">
          <CheckCircle className="w-4 h-4" />
          <span>Завершено</span>
        </div>
      ),
      in_progress: (
        <div className="flex items-center space-x-2 text-yellow-700 bg-yellow-100 px-3 py-1 rounded-full">
          <Clock className="w-4 h-4" />
          <span>В процессе</span>
        </div>
      ),
      not_started: (
        <div className="flex items-center space-x-2 text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
          <Target className="w-4 h-4" />
          <span>Не начато</span>
        </div>
      ),
    };
    return badges[node.status];
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{node.title}</h2>
          {node.description && (
            <p className="text-gray-600">{node.description}</p>
          )}
        </div>
        {getStatusBadge()}
      </div>

      <div className="space-y-6">
        {/* Управление обучением */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-4">
            {!isLearning ? (
              <button
                onClick={startLearning}
                disabled={node.status === 'completed'}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PlayCircle className="w-5 h-5" />
                <span>Начать изучение</span>
              </button>
            ) : (
              <button
                onClick={pauseLearning}
                className="flex items-center space-x-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
              >
                <PauseCircle className="w-5 h-5" />
                <span>Приостановить</span>
              </button>
            )}
            
            {node.status !== 'completed' && (
              <button
                onClick={() => updateProgress('completed', 100)}
                className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                <CheckCircle className="w-5 h-5" />
                <span>Отметить как изученное</span>
              </button>
            )}
          </div>
          
          <div className="flex items-center space-x-2 text-gray-600">
            <Clock className="w-5 h-5" />
            <span className="font-medium">{formatTime(timeSpent)}</span>
          </div>
        </div>

        {/* Прогресс */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-700 flex items-center space-x-2">
              <BarChart3 className="w-5 h-5" />
              <span>Прогресс изучения</span>
            </h3>
            <span className="text-2xl font-bold text-gray-800">{percentage}%</span>
          </div>
          
          <div className="relative">
            <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>
            
            <input
              type="range"
              min="0"
              max="100"
              value={percentage}
              onChange={(e) => handlePercentageChange(Number(e.target.value))}
              className="absolute inset-0 w-full opacity-0 cursor-pointer"
              disabled={node.status === 'completed'}
            />
          </div>
          
          <div className="flex justify-between mt-2 text-sm text-gray-500">
            <span>0%</span>
            <span>25%</span>
            <span>50%</span>
            <span>75%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Заметки */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 flex items-center space-x-2 mb-3">
            <StickyNote className="w-5 h-5" />
            <span>Заметки</span>
          </h3>
          
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Добавьте заметки о вашем прогрессе, что изучили, что осталось..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={4}
          />
          
          <button
            onClick={() => updateProgress(node.status, percentage)}
            disabled={saving}
            className="mt-3 flex items-center space-x-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Сохранение...' : 'Сохранить заметки'}</span>
          </button>
        </div>

        {/* Статистика */}
        {progress?.last_accessed && (
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Calendar className="w-4 h-4" />
            <span>
              Последнее обращение: {new Date(progress.last_accessed).toLocaleDateString('ru-RU')}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}