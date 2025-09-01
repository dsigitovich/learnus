import { StateCreator } from 'zustand';
import { LearningProgress, NodeStatus, ProgramStats } from '@/lib/types';

export interface ProgressSlice {
  // Состояние
  progress: Map<number, LearningProgress>;
  stats: ProgramStats | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setProgress: (nodeId: number, progress: LearningProgress) => void;
  setAllProgress: (progress: Map<number, LearningProgress>) => void;
  updateNodeStatus: (nodeId: number, status: NodeStatus, notes?: string) => void;
  resetProgress: () => void;
  setStats: (stats: ProgramStats) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;

  // Вспомогательные методы
  getNodeProgress: (nodeId: number) => LearningProgress | undefined;
  isNodeCompleted: (nodeId: number) => boolean;
  getCompletedNodes: () => number[];
}

export const createProgressSlice: StateCreator<ProgressSlice> = (set, get) => ({
  // Начальное состояние
  progress: new Map(),
  stats: null,
  isLoading: false,
  error: null,

  // Actions
  setProgress: (nodeId, progress) => set((state) => {
    const newProgress = new Map(state.progress);
    newProgress.set(nodeId, progress);
    return { progress: newProgress, error: null };
  }),
  
  setAllProgress: (progress) => set({ progress, error: null }),
  
  updateNodeStatus: (nodeId, status, notes) => set((state) => {
    const newProgress = new Map(state.progress);
    const existing = newProgress.get(nodeId) || {
      node_id: nodeId,
      status: 'not_started',
    };
    
    newProgress.set(nodeId, {
      ...existing,
      status,
      notes: notes !== undefined ? notes : existing.notes,
      completed_at: status === 'completed' ? new Date().toISOString() : existing.completed_at,
    });
    
    return { progress: newProgress, error: null };
  }),
  
  resetProgress: () => set({
    progress: new Map(),
    stats: null,
    error: null,
  }),
  
  setStats: (stats) => set({ stats, error: null }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error, isLoading: false }),

  // Вспомогательные методы
  getNodeProgress: (nodeId) => get().progress.get(nodeId),
  
  isNodeCompleted: (nodeId) => {
    const progress = get().progress.get(nodeId);
    return progress?.status === 'completed';
  },
  
  getCompletedNodes: () => {
    const completedNodes: number[] = [];
    get().progress.forEach((progress, nodeId) => {
      if (progress.status === 'completed') {
        completedNodes.push(nodeId);
      }
    });
    return completedNodes;
  },
});
