import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ChatMessage } from './types';

interface Chat {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
}

interface AppState {
  // Чаты
  chats: Chat[];
  currentChatId: string | null;
  
  // Методы для работы с чатами
  createNewChat: () => void;
  selectChat: (chatId: string) => void;
  deleteChat: (chatId: string) => void;
  updateChatTitle: (chatId: string, title: string) => void;
  
  // История текущего чата
  messages: ChatMessage[];
  addMessage: (message: ChatMessage) => void;
  clearMessages: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
  chats: [],
  currentChatId: null,
  messages: [],
  
  createNewChat: () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: 'Новый чат',
      messages: [],
      createdAt: new Date(),
    };
    
    set((state) => ({
      chats: [newChat, ...state.chats],
      currentChatId: newChat.id,
      messages: [],
    }));
  },
  
  selectChat: (chatId: string) => {
    const chat = get().chats.find(c => c.id === chatId);
    if (chat) {
      set({
        currentChatId: chatId,
        messages: chat.messages,
      });
    }
  },
  
  deleteChat: (chatId: string) => {
    set((state) => {
      const newChats = state.chats.filter(c => c.id !== chatId);
      const newCurrentId = state.currentChatId === chatId 
        ? (newChats.length > 0 ? newChats[0].id : null)
        : state.currentChatId;
      
      const currentChat = newCurrentId ? newChats.find(c => c.id === newCurrentId) : null;
      
      return {
        chats: newChats,
        currentChatId: newCurrentId,
        messages: currentChat ? currentChat.messages : [],
      };
    });
  },
  
  updateChatTitle: (chatId: string, title: string) => {
    set((state) => ({
      chats: state.chats.map(chat =>
        chat.id === chatId ? { ...chat, title } : chat
      ),
    }));
  },
  
  addMessage: (message: ChatMessage) => {
    set((state) => {
      // Если нет активного чата, создаем новый
      if (!state.currentChatId) {
        const newChat: Chat = {
          id: Date.now().toString(),
          title: message.content.slice(0, 30) + (message.content.length > 30 ? '...' : ''),
          messages: [message],
          createdAt: new Date(),
        };
        
        return {
          chats: [newChat, ...state.chats],
          currentChatId: newChat.id,
          messages: [message],
        };
      }
      
      // Обновляем существующий чат
      const updatedMessages = [...state.messages, message];
      const updatedChats = state.chats.map(chat => {
        if (chat.id === state.currentChatId) {
          // Обновляем заголовок чата первым сообщением пользователя
          const newTitle = chat.messages.length === 0 && message.role === 'user'
            ? message.content.slice(0, 30) + (message.content.length > 30 ? '...' : '')
            : chat.title;
          
          return { ...chat, messages: updatedMessages, title: newTitle };
        }
        return chat;
      });
      
      return {
        messages: updatedMessages,
        chats: updatedChats,
      };
    });
  },
  
  clearMessages: () => set({ messages: [] }),
    }),
    {
      name: 'learnus-storage',
      partialize: (state) => ({
        chats: state.chats,
        currentChatId: state.currentChatId,
      }),
    }
  )
);
