import { StateCreator } from 'zustand';
import { LearningProgram, ProgramNode } from '@/lib/types';

export interface ProgramSlice {
  // Состояние
  programs: LearningProgram[];
  currentProgram: LearningProgram | null;
  nodes: ProgramNode[];
  selectedNode: ProgramNode | null;
  isLoading: boolean;
  error: string | null;

  // Actions для программ
  setPrograms: (programs: LearningProgram[]) => void;
  addProgram: (program: LearningProgram) => void;
  updateProgram: (id: number, updates: Partial<LearningProgram>) => void;
  deleteProgram: (id: number) => void;
  setCurrentProgram: (program: LearningProgram | null) => void;

  // Actions для узлов
  setNodes: (nodes: ProgramNode[]) => void;
  addNode: (node: ProgramNode) => void;
  updateNode: (id: string, updates: Partial<ProgramNode>) => void;
  deleteNode: (id: string) => void;
  setSelectedNode: (node: ProgramNode | null) => void;
  moveNode: (id: string, position: { x: number; y: number }) => void;

  // Actions для состояния загрузки
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Вспомогательные методы
  getProgramById: (id: number) => LearningProgram | undefined;
  getNodeById: (id: string) => ProgramNode | undefined;
  getNodesByParent: (parentId?: number | null) => ProgramNode[];
}

export const createProgramSlice: StateCreator<ProgramSlice> = (set, get) => ({
  // Начальное состояние
  programs: [],
  currentProgram: null,
  nodes: [],
  selectedNode: null,
  isLoading: false,
  error: null,

  // Actions для программ
  setPrograms: (programs) => set({ programs, error: null }),
  
  addProgram: (program) => set((state) => ({
    programs: [...state.programs, program],
    error: null,
  })),
  
  updateProgram: (id, updates) => set((state) => ({
    programs: state.programs.map((p) =>
      p.id === id ? { ...p, ...updates } : p
    ),
    currentProgram:
      state.currentProgram?.id === id
        ? { ...state.currentProgram, ...updates }
        : state.currentProgram,
    error: null,
  })),
  
  deleteProgram: (id) => set((state) => ({
    programs: state.programs.filter((p) => p.id !== id),
    currentProgram: state.currentProgram?.id === id ? null : state.currentProgram,
    nodes: state.currentProgram?.id === id ? [] : state.nodes,
    error: null,
  })),
  
  setCurrentProgram: (program) => set({
    currentProgram: program,
    nodes: [],
    selectedNode: null,
    error: null,
  }),

  // Actions для узлов
  setNodes: (nodes) => set({ nodes, error: null }),
  
  addNode: (node) => set((state) => ({
    nodes: [...state.nodes, node],
    error: null,
  })),
  
  updateNode: (id, updates) => set((state) => ({
    nodes: state.nodes.map((n) =>
      n.id === id ? { ...n, ...updates } : n
    ),
    selectedNode:
      state.selectedNode?.id === id
        ? { ...state.selectedNode, ...updates }
        : state.selectedNode,
    error: null,
  })),
  
  deleteNode: (id) => set((state) => ({
    nodes: state.nodes.filter((n) => n.id !== id),
    selectedNode: state.selectedNode?.id === id ? null : state.selectedNode,
    error: null,
  })),
  
  setSelectedNode: (node) => set({ selectedNode: node, error: null }),
  
  moveNode: (id, position) => set((state) => ({
    nodes: state.nodes.map((n) =>
      n.id === id ? { ...n, position } : n
    ),
    selectedNode:
      state.selectedNode?.id === id
        ? { ...state.selectedNode, position }
        : state.selectedNode,
    error: null,
  })),

  // Actions для состояния загрузки
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),

  // Вспомогательные методы
  getProgramById: (id) => get().programs.find((p) => p.id === id),
  
  getNodeById: (id) => get().nodes.find((n) => n.id === id),
  
  getNodesByParent: (parentId) =>
    get().nodes.filter((n) => n.parent_id === parentId),
});
