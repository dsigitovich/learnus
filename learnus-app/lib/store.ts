import { create } from 'zustand';
import { LearningProgram, ProgramNode, ChatMessage } from './types';

interface AppState {
  // Текущая учебная программа
  currentProgram: LearningProgram | null;
  setCurrentProgram: (program: LearningProgram | null) => void;
  
  // Узлы программы
  nodes: ProgramNode[];
  setNodes: (nodes: ProgramNode[]) => void;
  addNode: (node: ProgramNode) => void;
  updateNode: (id: string, updates: Partial<ProgramNode>) => void;
  
  // Выбранный узел
  selectedNode: ProgramNode | null;
  setSelectedNode: (node: ProgramNode | null) => void;
  
  // История чата
  messages: ChatMessage[];
  addMessage: (message: ChatMessage) => void;
  clearMessages: () => void;
  
  // Режим просмотра
  viewMode: 'chat' | 'tree';
  setViewMode: (mode: 'chat' | 'tree') => void;
}

export const useStore = create<AppState>((set) => ({
  currentProgram: null,
  setCurrentProgram: (program) => set({ currentProgram: program }),
  
  nodes: [],
  setNodes: (nodes) => set({ nodes }),
  addNode: (node) => set((state) => ({ nodes: [...state.nodes, node] })),
  updateNode: (id, updates) => set((state) => ({
    nodes: state.nodes.map((node) => 
      node.id === id ? { ...node, ...updates } : node
    )
  })),
  
  selectedNode: null,
  setSelectedNode: (node) => set({ selectedNode: node }),
  
  messages: [],
  addMessage: (message) => set((state) => ({ 
    messages: [...state.messages, message] 
  })),
  clearMessages: () => set({ messages: [] }),
  
  viewMode: 'chat',
  setViewMode: (mode) => set({ viewMode: mode }),
}));