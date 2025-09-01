import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

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
      (...args) => ({
        ...createProgramSlice(...args),
        ...createChatSlice(...args),
        ...createProgressSlice(...args),
        ...createUISlice(...args),
      }),
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

// Стабильные селекторы для оптимизации ре-рендеров
export const useProgramStore = useStore;

export const useChatStore = useStore;

export const useProgressStore = useStore;

export const useUIStore = useStore;

// Экспорт типов
export type { ProgramSlice, ChatSlice, ProgressSlice, UISlice };
