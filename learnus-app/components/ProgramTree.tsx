'use client';

import { useCallback, useEffect, useState } from 'react';
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
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useStore } from '@/lib/store';
import { ProgramNode } from '@/lib/types';
import { Plus, CheckCircle, Circle, Clock } from 'lucide-react';

const nodeTypes = {
  custom: ({ data }: { data: any }) => (
    <div
      className={`px-4 py-2 rounded-lg border-2 cursor-pointer transition-all ${
        data.selected ? 'border-blue-500 shadow-lg' : 'border-gray-300'
      } ${
        data.status === 'completed' 
          ? 'bg-green-50 border-green-500' 
          : data.status === 'in_progress'
          ? 'bg-yellow-50 border-yellow-500'
          : 'bg-white'
      }`}
    >
      <div className="flex items-center space-x-2">
        {data.status === 'completed' ? (
          <CheckCircle className="w-4 h-4 text-green-600" />
        ) : data.status === 'in_progress' ? (
          <Clock className="w-4 h-4 text-yellow-600" />
        ) : (
          <Circle className="w-4 h-4 text-gray-400" />
        )}
        <div className="font-medium">{data.label}</div>
      </div>
    </div>
  ),
};

export default function ProgramTree() {
  const { currentProgram, nodes: programNodes, setSelectedNode, selectedNode } = useStore();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newNodeData, setNewNodeData] = useState({ title: '', description: '' });
  
  // Преобразование данных из БД в формат ReactFlow
  useEffect(() => {
    if (programNodes.length > 0) {
      const flowNodes: Node[] = programNodes.map((node) => ({
        id: node.id.toString(),
        position: { x: node.position.x, y: node.position.y },
        type: 'custom',
        data: { 
          label: node.title,
          status: node.status,
          selected: selectedNode?.id === node.id,
        },
      }));
      
      const flowEdges: Edge[] = programNodes
        .filter(node => node.parent_id)
        .map((node) => ({
          id: `e${node.parent_id}-${node.id}`,
          source: node.parent_id!.toString(),
          target: node.id.toString(),
          markerEnd: { type: MarkerType.ArrowClosed },
        }));
      
      setNodes(flowNodes);
      setEdges(flowEdges);
    }
  }, [programNodes, selectedNode, setNodes, setEdges]);
  
  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );
  
  const onNodeClick = useCallback((_event: any, node: Node) => {
    const programNode: ProgramNode | undefined = programNodes.find(n => n.id.toString() === node.id);
    if (programNode) {
      setSelectedNode(programNode);
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
        // Обновить список узлов
        setShowAddDialog(false);
        setNewNodeData({ title: '', description: '' });
      }
    } catch (error) {
      console.error('Error adding node:', error);
    }
  };
  
  if (!currentProgram) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Выберите или создайте учебную программу
          </h2>
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-screen bg-gray-50">
      <div className="absolute top-4 left-4 z-10">
        <button
          onClick={() => setShowAddDialog(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus size={20} />
          <span>Добавить тему</span>
        </button>
      </div>
      
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background />
        <Controls />
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
    </div>
  );
}
