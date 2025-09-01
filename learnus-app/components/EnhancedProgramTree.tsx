'use client';

import { useCallback, useEffect, useState, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  MarkerType,
  Background,
  Controls,
  MiniMap,
  Panel,
  ReactFlowProvider,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useStore } from '@/lib/store';
import { ProgramNode } from '@/lib/types';
import { 
  Plus, 
  CheckCircle, 
  Circle, 
  Clock, 
  Play,
  Lock,
  Unlock,
  ChevronRight,
  BarChart3,
  Target,
  Sparkles,
  X
} from 'lucide-react';
import NodeProgressPanel from './NodeProgressPanel';

interface NodeData {
  label: string;
  status: 'not_started' | 'in_progress' | 'completed';
  selected: boolean;
  description?: string;
  progress?: number;
  isAvailable: boolean;
  estimatedTime?: string;
}

const CustomNode = ({ data }: { data: NodeData }) => {
  const statusIcons = {
    completed: <CheckCircle className="w-5 h-5 text-green-600" />,
    in_progress: <Clock className="w-5 h-5 text-yellow-600 animate-pulse" />,
    not_started: data.isAvailable ? (
      <Circle className="w-5 h-5 text-gray-400" />
    ) : (
      <Lock className="w-5 h-5 text-gray-400" />
    ),
  };

  const statusColors = {
    completed: 'bg-gradient-to-br from-green-50 to-green-100 border-green-500',
    in_progress: 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-500',
    not_started: data.isAvailable
      ? 'bg-gradient-to-br from-white to-gray-50 border-gray-300'
      : 'bg-gradient-to-br from-gray-100 to-gray-200 border-gray-400 opacity-75',
  };

  const getProgressBar = () => {
    if (data.status === 'not_started') return null;
    const progress = data.status === 'completed' ? 100 : (data.progress || 50);
    
    return (
      <div className="w-full h-1 bg-gray-200 rounded-full mt-2">
        <div 
          className={`h-full rounded-full transition-all duration-500 ${
            data.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
    );
  };

  return (
    <div
      className={`px-4 py-3 rounded-xl border-2 cursor-pointer transition-all duration-200 
        ${data.selected ? 'ring-4 ring-blue-400 ring-opacity-50 shadow-xl scale-105' : 'shadow-md hover:shadow-lg'} 
        ${statusColors[data.status]} min-w-[200px] max-w-[250px]`}
    >
      <div className="flex items-start justify-between mb-1">
        <div className="flex-1">
          <div className="font-semibold text-gray-800 leading-tight">
            {data.label}
          </div>
          {data.description && (
            <div className="text-xs text-gray-600 mt-1 line-clamp-2">
              {data.description}
            </div>
          )}
        </div>
        <div className="ml-2 flex-shrink-0">
          {statusIcons[data.status]}
        </div>
      </div>
      
      {getProgressBar()}
      
      {data.estimatedTime && data.status !== 'completed' && (
        <div className="text-xs text-gray-500 mt-2 flex items-center">
          <Target className="w-3 h-3 mr-1" />
          {data.estimatedTime}
        </div>
      )}
      
      {data.isAvailable && data.status === 'not_started' && (
        <div className="absolute -right-2 -top-2 bg-blue-500 text-white rounded-full p-1 shadow-md">
          <Play className="w-3 h-3" />
        </div>
      )}
    </div>
  );
};

const nodeTypes = {
  custom: CustomNode,
};

function ProgramTreeFlow() {
  const { currentProgram, nodes: programNodes, setSelectedNode, selectedNode } = useStore();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showProgressPanel, setShowProgressPanel] = useState(false);
  const [newNodeData, setNewNodeData] = useState({ title: '', description: '' });
  const { fitView } = useReactFlow();
  
  // Вычисление доступности узлов на основе завершенных предшественников
  const calculateNodeAvailability = useCallback((node: ProgramNode): boolean => {
    if (!node.parent_id) return true; // Корневые узлы всегда доступны
    
    const parent = programNodes.find(n => n.id === node.parent_id?.toString());
    if (!parent) return true;
    
    return parent.status === 'completed';
  }, [programNodes]);
  
  // Вычисление общего прогресса
  const overallProgress = useMemo(() => {
    if (programNodes.length === 0) return 0;
    const completedCount = programNodes.filter(n => n.status === 'completed').length;
    return Math.round((completedCount / programNodes.length) * 100);
  }, [programNodes]);
  
  // Загрузка последней позиции при открытии программы
  useEffect(() => {
    if (currentProgram && !selectedNode) {
      checkLastPosition();
    }
  }, [currentProgram]);

  const checkLastPosition = async () => {
    if (!currentProgram) return;
    
    try {
      const response = await fetch(`/api/programs/${currentProgram.id}/position`);
      const data = await response.json();
      
      if (data.current_node_id && data.node) {
        const node = programNodes.find(n => n.id === data.current_node_id.toString());
        if (node) {
          setSelectedNode(node);
          // Показываем уведомление о продолжении
          setShowProgressPanel(true);
        }
      }
    } catch (error) {
      console.error('Error loading position:', error);
    }
  };

  // Преобразование данных из БД в формат ReactFlow
  useEffect(() => {
    if (programNodes.length > 0) {
      const flowNodes: Node[] = programNodes.map((node) => ({
        id: node.id.toString(),
        position: { x: node.position.x, y: node.position.y },
        type: 'custom',
        data: { 
          label: node.title,
          description: node.description,
          status: node.status,
          selected: selectedNode?.id === node.id,
          isAvailable: calculateNodeAvailability(node),
          progress: node.status === 'in_progress' ? 50 : 0,
        } as NodeData,
      }));
      
      const flowEdges: Edge[] = programNodes
        .filter(node => node.parent_id)
        .map((node) => ({
          id: `e${node.parent_id}-${node.id}`,
          source: node.parent_id!.toString(),
          target: node.id.toString(),
          markerEnd: { type: MarkerType.ArrowClosed },
          animated: node.status === 'in_progress',
          style: {
            stroke: node.status === 'completed' ? '#10b981' : 
                   node.status === 'in_progress' ? '#f59e0b' : '#9ca3af',
            strokeWidth: 2,
          },
        }));
      
      setNodes(flowNodes);
      setEdges(flowEdges);
      
      // Автоматическая подгонка после загрузки
      setTimeout(() => fitView({ padding: 0.2 }), 100);
    }
  }, [programNodes, selectedNode, setNodes, setEdges, calculateNodeAvailability, fitView]);
  
  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );
  
  const onNodeClick = useCallback((event: any, node: Node) => {
    const programNode = programNodes.find(n => n.id.toString() === node.id);
    if (programNode) {
      setSelectedNode(programNode);
      setShowProgressPanel(true);
    }
  }, [programNodes, setSelectedNode]);
  
  const handleAddNode = async () => {
    if (!currentProgram || !newNodeData.title) return;
    
    try {
      const response = await fetch(`/api/programs/${currentProgram.id}/nodes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newNodeData.title,
          description: newNodeData.description,
          position_x: 250,
          position_y: 250,
        }),
      });
      
      if (response.ok) {
        setShowAddDialog(false);
        setNewNodeData({ title: '', description: '' });
        // Обновить список узлов
      }
    } catch (error) {
      console.error('Error adding node:', error);
    }
  };
  
  const handleStartLearning = () => {
    const availableNodes = programNodes.filter(node => 
      calculateNodeAvailability(node) && node.status === 'not_started'
    );
    if (availableNodes.length > 0) {
      setSelectedNode(availableNodes[0]);
    }
  };
  
  const handleContinueLearning = () => {
    const inProgressNodes = programNodes.filter(node => node.status === 'in_progress');
    if (inProgressNodes.length > 0) {
      setSelectedNode(inProgressNodes[0]);
    }
  };
  
  if (!currentProgram) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-700 mb-4">
            Выберите или создайте учебную программу
          </h2>
          <p className="text-gray-600">
            Используйте боковую панель для начала обучения
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Panel position="top-left" className="bg-white rounded-lg shadow-lg p-4 m-4">
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">{currentProgram.title}</h2>
            {currentProgram.description && (
              <p className="text-sm text-gray-600 mt-1">{currentProgram.description}</p>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Общий прогресс</span>
                <span className="text-sm font-bold text-gray-800">{overallProgress}%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-500"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
            </div>
            <BarChart3 className="w-6 h-6 text-gray-400" />
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={handleStartLearning}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Play size={16} />
              <span>Начать обучение</span>
            </button>
            
            {programNodes.some(n => n.status === 'in_progress') && (
              <button
                onClick={handleContinueLearning}
                className="flex items-center space-x-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
              >
                <ChevronRight size={16} />
                <span>Продолжить</span>
              </button>
            )}
            
            <button
              onClick={() => setShowAddDialog(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              <Plus size={16} />
              <span>Добавить тему</span>
            </button>
          </div>
        </div>
      </Panel>
      
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        className="bg-transparent"
      >
        <Background color="#e5e7eb" gap={16} />
        <Controls className="bg-white rounded-lg shadow-lg" />
        <MiniMap 
          className="bg-white rounded-lg shadow-lg"
          nodeColor={(node) => {
            const data = node.data as NodeData;
            if (data.status === 'completed') return '#10b981';
            if (data.status === 'in_progress') return '#f59e0b';
            return '#9ca3af';
          }}
        />
      </ReactFlow>
      
      {/* Диалог добавления узла */}
      {showAddDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Добавить новую тему</h3>
            <input
              type="text"
              placeholder="Название темы"
              value={newNodeData.title}
              onChange={(e) => setNewNodeData({ ...newNodeData, title: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <textarea
              placeholder="Описание (необязательно)"
              value={newNodeData.description}
              onChange={(e) => setNewNodeData({ ...newNodeData, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowAddDialog(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Отмена
              </button>
              <button
                onClick={handleAddNode}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Добавить
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Панель прогресса узла */}
      {showProgressPanel && selectedNode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="relative">
            <button
              onClick={() => setShowProgressPanel(false)}
              className="absolute -top-2 -right-2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 z-10"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
            <NodeProgressPanel 
              node={selectedNode}
              onClose={() => setShowProgressPanel(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function EnhancedProgramTree() {
  return (
    <ReactFlowProvider>
      <ProgramTreeFlow />
    </ReactFlowProvider>
  );
}