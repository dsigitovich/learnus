'use client';

import React, { useCallback, useState } from 'react';
import { useStore } from '@/lib/store';
import { ProgramNode, NodeStatus } from '@/lib/types';
import { Plus, CheckCircle, Circle, Clock, Edit2, Trash2, ChevronDown, ChevronRight } from 'lucide-react';

export default function ProgramTable() {
  const { currentProgram, nodes: programNodes, setSelectedNode, selectedNode } = useStore();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newNodeData, setNewNodeData] = useState({ title: '', description: '' });
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [editingNode, setEditingNode] = useState<string | null>(null);
  const [editData, setEditData] = useState({ title: '', description: '' });
  
  // Построение иерархической структуры из плоского списка
  const buildNodeTree = (nodes: ProgramNode[]): ProgramNode[] => {
    const nodeMap = new Map<string, ProgramNode & { children?: ProgramNode[] }>();
    const rootNodes: (ProgramNode & { children?: ProgramNode[] })[] = [];
    
    // Создаем карту всех узлов
    nodes.forEach(node => {
      nodeMap.set(node.id, { ...node, children: [] });
    });
    
    // Строим дерево
    nodes.forEach(node => {
      const currentNode = nodeMap.get(node.id)!;
      if (node.parent_id) {
        const parent = nodeMap.get(node.parent_id.toString());
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(currentNode);
        }
      } else {
        rootNodes.push(currentNode);
      }
    });
    
    return rootNodes;
  };
  
  const toggleNodeExpansion = (nodeId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };
  
  const handleNodeClick = (node: ProgramNode) => {
    setSelectedNode(node);
  };
  
  const handleAddNode = async () => {
    if (!currentProgram || !newNodeData.title) return;
    
    try {
      const response = await fetch(`/api/programs/${currentProgram.id}/nodes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newNodeData.title,
          description: newNodeData.description,
          parent_id: selectedNode?.id || null,
          position_x: 0,
          position_y: 0,
        }),
      });
      
      if (response.ok) {
        setShowAddDialog(false);
        setNewNodeData({ title: '', description: '' });
        // Обновление будет выполнено через хук useNodes
      }
    } catch (error) {
      console.error('Error adding node:', error);
    }
  };
  
  const handleEditNode = async (node: ProgramNode) => {
    if (!editData.title) return;
    
    try {
      const response = await fetch(`/api/nodes/${node.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editData.title,
          description: editData.description,
        }),
      });
      
      if (response.ok) {
        setEditingNode(null);
        setEditData({ title: '', description: '' });
      }
    } catch (error) {
      console.error('Error editing node:', error);
    }
  };
  
  const handleDeleteNode = async (node: ProgramNode) => {
    if (!confirm(`Вы уверены, что хотите удалить тему "${node.title}"?`)) return;
    
    try {
      const response = await fetch(`/api/nodes/${node.id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        // Обновление будет выполнено через хук useNodes
      }
    } catch (error) {
      console.error('Error deleting node:', error);
    }
  };
  
  const startEditing = (node: ProgramNode) => {
    setEditingNode(node.id);
    setEditData({ title: node.title, description: node.description || '' });
  };
  
  const getStatusIcon = (status: NodeStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };
  
  const getStatusText = (status: NodeStatus) => {
    switch (status) {
      case 'completed':
        return 'Завершено';
      case 'in_progress':
        return 'В процессе';
      default:
        return 'Не начато';
    }
  };
  
  const renderNodeRow = (node: ProgramNode & { children?: ProgramNode[] }, level: number = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes.has(node.id);
    const isSelected = selectedNode?.id === node.id;
    const isEditing = editingNode === node.id;
    
    return (
      <React.Fragment key={node.id}>
        <tr 
          className={`border-b transition-all hover:bg-gray-50 ${
            isSelected ? 'bg-blue-50' : ''
          }`}
        >
          <td className="px-4 py-3" style={{ paddingLeft: `${level * 24 + 16}px` }}>
            <div className="flex items-center space-x-2">
              {hasChildren ? (
                <button
                  onClick={() => toggleNodeExpansion(node.id)}
                  className="p-1 rounded hover:bg-gray-200"
                >
                  {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
              ) : (
                <div className="w-6" />
              )}
              {isEditing ? (
                <input
                  type="text"
                  value={editData.title}
                  onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                  className="flex-1 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleEditNode(node);
                    if (e.key === 'Escape') setEditingNode(null);
                  }}
                />
              ) : (
                <button
                  onClick={() => handleNodeClick(node)}
                  className="text-left font-medium hover:text-blue-600"
                >
                  {node.title}
                </button>
              )}
            </div>
          </td>
          <td className="px-4 py-3">
            {isEditing ? (
              <input
                type="text"
                value={editData.description}
                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Описание (необязательно)"
              />
            ) : (
              <span className="text-gray-600 text-sm">{node.description || '—'}</span>
            )}
          </td>
          <td className="px-4 py-3">
            <div className="flex items-center space-x-2">
              {getStatusIcon(node.status)}
              <span className="text-sm">{getStatusText(node.status)}</span>
            </div>
          </td>
          <td className="px-4 py-3">
            <div className="flex items-center space-x-2">
              {isEditing ? (
                <>
                  <button
                    onClick={() => handleEditNode(node)}
                    className="text-green-600 hover:text-green-700"
                  >
                    ✓
                  </button>
                  <button
                    onClick={() => setEditingNode(null)}
                    className="text-red-600 hover:text-red-700"
                  >
                    ✕
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => startEditing(node)}
                    className="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteNode(node)}
                    className="p-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </td>
        </tr>
        {hasChildren && isExpanded && (
          node.children!.map(child => renderNodeRow(child, level + 1))
        )}
      </React.Fragment>
    );
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
  
  const treeNodes = buildNodeTree(programNodes);
  
  return (
    <div className="h-screen bg-gray-50 overflow-hidden flex flex-col">
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">{currentProgram.title}</h1>
        <button
          onClick={() => setShowAddDialog(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus size={20} />
          <span>Добавить тему</span>
        </button>
      </div>
      
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Название темы</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Описание</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Статус</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Действия</th>
                </tr>
              </thead>
              <tbody>
                {treeNodes.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                      Пока нет тем. Нажмите "Добавить тему", чтобы создать первую.
                    </td>
                  </tr>
                ) : (
                  treeNodes.map(node => renderNodeRow(node))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Диалог добавления узла */}
      {showAddDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">
              Добавить новую тему
              {selectedNode && (
                <span className="text-sm font-normal text-gray-600 block mt-1">
                  в "{selectedNode.title}"
                </span>
              )}
            </h3>
            <input
              type="text"
              placeholder="Название темы"
              value={newNodeData.title}
              onChange={(e) => setNewNodeData({ ...newNodeData, title: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
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
                onClick={() => {
                  setShowAddDialog(false);
                  setNewNodeData({ title: '', description: '' });
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Отмена
              </button>
              <button
                onClick={handleAddNode}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                disabled={!newNodeData.title}
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