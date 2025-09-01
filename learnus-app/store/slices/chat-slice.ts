import { StateCreator } from 'zustand';
import { ChatMessage } from '@/lib/types';

export interface ChatSlice {
  // Состояние
  messages: ChatMessage[];
  isTyping: boolean;
  error: string | null;

  // Actions
  setMessages: (messages: ChatMessage[]) => void;
  addMessage: (message: ChatMessage) => void;
  clearMessages: () => void;
  setTyping: (isTyping: boolean) => void;
  setError: (error: string | null) => void;

  // Вспомогательные методы
  getLastMessage: () => ChatMessage | undefined;
  getMessagesByRole: (role: ChatMessage['role']) => ChatMessage[];
}

export const createChatSlice: StateCreator<ChatSlice> = (set, get) => ({
  // Начальное состояние
  messages: [],
  isTyping: false,
  error: null,

  // Actions
  setMessages: (messages) => set({ messages, error: null }),
  
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message],
    error: null,
  })),
  
  clearMessages: () => set({ messages: [], error: null }),
  
  setTyping: (isTyping) => set({ isTyping }),
  
  setError: (error) => set({ error, isTyping: false }),

  // Вспомогательные методы
  getLastMessage: () => {
    const messages = get().messages;
    return messages[messages.length - 1];
  },
  
  getMessagesByRole: (role) =>
    get().messages.filter((m) => m.role === role),
});