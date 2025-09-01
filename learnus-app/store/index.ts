import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// Импорт слайсов
import { ProgramSlice, createProgramSlice } from './slices/program-slice';
import { ChatSlice, createChatSlice } from './slices/chat-slice';
import { ProgressSlice, createProgressSlice } from './slices/progress-slice';
import { UISlice, createUISlice } from './slices/ui-slice';

// Объединенный тип store
export type AppStore = ProgramSlice & ChatSlice & ProgressSlice & UISlice;

// Создание store с middleware
export const useStore = create<AppStore>()(
  devtools(
    persist(
      immer((...args) => ({
        ...createProgramSlice(...args),
        ...createChatSlice(...args),
        ...createProgressSlice(...args),
        ...createUISlice(...args),
      })),
      {
        name: 'learnus-store',
        // Сохраняем только UI настройки
        partialize: (state) => ({
          viewMode: state.viewMode,
          theme: state.theme,
          sidebarOpen: state.sidebarOpen,
        }),
      }
    ),
    {
      name: 'Learnus Store',
    }
  )
);

// Селекторы для оптимизации ре-рендеров
export const useProgramStore = () => useStore((state) => ({
  programs: state.programs,
  currentProgram: state.currentProgram,
  nodes: state.nodes,
  selectedNode: state.selectedNode,
  isLoading: state.isLoading,
  error: state.error,
  setPrograms: state.setPrograms,
  addProgram: state.addProgram,
  updateProgram: state.updateProgram,
  deleteProgram: state.deleteProgram,
  setCurrentProgram: state.setCurrentProgram,
  setNodes: state.setNodes,
  addNode: state.addNode,
  updateNode: state.updateNode,
  deleteNode: state.deleteNode,
  setSelectedNode: state.setSelectedNode,
  moveNode: state.moveNode,
  setLoading: state.setLoading,
  setError: state.setError,
  getProgramById: state.getProgramById,
  getNodeById: state.getNodeById,
  getNodesByParent: state.getNodesByParent,
}));

export const useChatStore = () => useStore((state) => ({
  messages: state.messages,
  isTyping: state.isTyping,
  error: state.error,
  setMessages: state.setMessages,
  addMessage: state.addMessage,
  clearMessages: state.clearMessages,
  setTyping: state.setTyping,
  getLastMessage: state.getLastMessage,
  getMessagesByRole: state.getMessagesByRole,
}));

export const useProgressStore = () => useStore((state) => ({
  progress: state.progress,
  stats: state.stats,
  isLoading: state.isLoading,
  error: state.error,
  setProgress: state.setProgress,
  setAllProgress: state.setAllProgress,
  updateNodeStatus: state.updateNodeStatus,
  resetProgress: state.resetProgress,
  setStats: state.setStats,
  getNodeProgress: state.getNodeProgress,
  isNodeCompleted: state.isNodeCompleted,
  getCompletedNodes: state.getCompletedNodes,
}));

export const useUIStore = () => useStore((state) => ({
  viewMode: state.viewMode,
  theme: state.theme,
  sidebarOpen: state.sidebarOpen,
  notifications: state.notifications,
  isFullscreen: state.isFullscreen,
  setViewMode: state.setViewMode,
  setTheme: state.setTheme,
  toggleSidebar: state.toggleSidebar,
  setSidebarOpen: state.setSidebarOpen,
  addNotification: state.addNotification,
  removeNotification: state.removeNotification,
  clearNotifications: state.clearNotifications,
  setFullscreen: state.setFullscreen,
  hasNotifications: state.hasNotifications,
  getNotificationsByType: state.getNotificationsByType,
}));

// Экспорт типов
export type { ProgramSlice, ChatSlice, ProgressSlice, UISlice };
