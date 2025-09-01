import { useCallback } from 'react';
import { useProgramStore } from '@/store';
import { nodeService } from '@/lib/services';
import { ProgramNode } from '@/lib/types';

export function useNodes() {
  const {
    nodes,
    selectedNode,
    isLoading,
    error,
    addNode,
    updateNode,
    deleteNode,
    setSelectedNode,
    moveNode,
    setLoading,
    setError,
    getNodeById,
    getNodesByParent,
  } = useProgramStore();

  // Создание нового узла
  const createNode = useCallback(
    async (data: {
      programId: number;
      title: string;
      description?: string;
      content?: string;
      position: { x: number; y: number };
      parentId?: number;
    }) => {
      setLoading(true);
      try {
        const node = await nodeService.createNode(data);
        addNode(node);
        return node;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create node');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [addNode, setLoading, setError]
  );

  // Обновление узла
  const updateNodeData = useCallback(
    async (id: string, updates: Partial<ProgramNode>) => {
      setLoading(true);
      try {
        // Преобразуем null в undefined для совместимости с UpdateNodeSchema
        const cleanUpdates = {
          ...updates,
          description: updates.description === null ? undefined : updates.description,
          content: updates.content === null ? undefined : updates.content,
        };
        const node = await nodeService.updateNode(id, cleanUpdates);
        updateNode(id, node);
        return node;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update node');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [updateNode, setLoading, setError]
  );

  // Удаление узла
  const removeNode = useCallback(
    async (id: string) => {
      setLoading(true);
      try {
        await nodeService.deleteNode(id);
        deleteNode(id);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete node');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [deleteNode, setLoading, setError]
  );

  // Перемещение узла
  const moveNodePosition = useCallback(
    async (id: string, position: { x: number; y: number }) => {
      // Сначала обновляем локально для быстрого отклика
      moveNode(id, position);
      
      try {
        await nodeService.moveNode(id, position);
      } catch (err) {
        // При ошибке можно откатить изменения
        setError(err instanceof Error ? err.message : 'Failed to move node');
      }
    },
    [moveNode, setError]
  );

  // Связывание узлов
  const linkNodes = useCallback(
    async (parentId: number, childId: number) => {
      setLoading(true);
      try {
        await nodeService.linkNodes(parentId, childId);
        // Перезагружаем узлы для обновления связей
        const node = await nodeService.getNodeById(childId.toString());
        if (node) {
          updateNode(childId.toString(), node);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to link nodes');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [updateNode, setLoading, setError]
  );

  // Удаление связи между узлами
  const unlinkNode = useCallback(
    async (childId: number) => {
      setLoading(true);
      try {
        await nodeService.unlinkNode(childId);
        // Обновляем узел
        const node = await nodeService.getNodeById(childId.toString());
        if (node) {
          updateNode(childId.toString(), node);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to unlink node');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [updateNode, setLoading, setError]
  );

  // Построение дерева узлов
  const buildNodeTree = useCallback(() => {
    const nodeMap = new Map<string, ProgramNode & { children: ProgramNode[] }>();
    const rootNodes: (ProgramNode & { children: ProgramNode[] })[] = [];

    // Создаем копии узлов с массивом children
    nodes.forEach(node => {
      nodeMap.set(node.id, { ...node, children: [] });
    });

    // Строим дерево
    nodes.forEach(node => {
      const nodeWithChildren = nodeMap.get(node.id)!;
      
      if (node.parent_id) {
        const parent = nodeMap.get(node.parent_id.toString());
        if (parent) {
          parent.children.push(nodeWithChildren);
        } else {
          // Если родитель не найден, добавляем в корень
          rootNodes.push(nodeWithChildren);
        }
      } else {
        rootNodes.push(nodeWithChildren);
      }
    });

    return rootNodes;
  }, [nodes]);

  return {
    nodes,
    selectedNode,
    isLoading,
    error,
    createNode,
    updateNodeData,
    removeNode,
    moveNodePosition,
    linkNodes,
    unlinkNode,
    setSelectedNode,
    getNodeById,
    getNodesByParent,
    buildNodeTree,
  };
}

// Хук для работы с конкретным узлом
export function useNode(nodeId: string) {
  const { getNodeById, updateNodeData, setSelectedNode } = useNodes();
  
  const node = getNodeById(nodeId);
  
  const selectNode = useCallback(() => {
    if (node) {
      setSelectedNode(node);
    }
  }, [node, setSelectedNode]);
  
  const updateNode = useCallback(
    (updates: Partial<ProgramNode>) => {
      return updateNodeData(nodeId, updates);
    },
    [nodeId, updateNodeData]
  );
  
  return {
    node,
    selectNode,
    updateNode,
  };
}
