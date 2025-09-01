import { StateCreator } from 'zustand';
import { ViewMode, Theme, Notification } from '@/lib/types';

export interface UISlice {
  // Состояние
  viewMode: ViewMode;
  theme: Theme;
  sidebarOpen: boolean;
  notifications: Notification[];
  isFullscreen: boolean;

  // Actions
  setViewMode: (mode: ViewMode) => void;
  setTheme: (theme: Theme) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  setFullscreen: (isFullscreen: boolean) => void;

  // Вспомогательные методы
  hasNotifications: () => boolean;
  getNotificationsByType: (type: Notification['type']) => Notification[];
}

export const createUISlice: StateCreator<UISlice> = (set, get) => ({
  // Начальное состояние
  viewMode: 'chat',
  theme: 'system',
  sidebarOpen: true,
  notifications: [],
  isFullscreen: false,

  // Actions
  setViewMode: (mode) => set({ viewMode: mode }),
  
  setTheme: (theme) => set({ theme }),
  
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  
  addNotification: (notification) => set((state) => {
    const id = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration ?? 5000,
    };
    
    // Автоматически удаляем уведомление после истечения времени
    if (newNotification.duration > 0) {
      setTimeout(() => {
        get().removeNotification(id);
      }, newNotification.duration);
    }
    
    return {
      notifications: [...state.notifications, newNotification],
    };
  }),
  
  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter((n) => n.id !== id),
  })),
  
  clearNotifications: () => set({ notifications: [] }),
  
  setFullscreen: (isFullscreen) => set({ isFullscreen }),

  // Вспомогательные методы
  hasNotifications: () => get().notifications.length > 0,
  
  getNotificationsByType: (type) =>
    get().notifications.filter((n) => n.type === type),
});
