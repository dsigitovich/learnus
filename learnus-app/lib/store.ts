import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ChatMessage, Course, ChatType, CourseProgress, User, AuthState } from './types';

interface Chat {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  type: ChatType;
  courseId?: string; // Если это чат курса, то здесь ID курса
  courseProgress?: CourseProgress; // Прогресс прохождения курса
}

interface AppState extends AuthState {
  // Чаты
  chats: Chat[];
  currentChatId: string | null;
  
  // Курсы
  courses: Course[];
  currentCourseId: string | null;
  
  // Методы для работы с чатами
  createGeneralChat: () => void;
  selectChat: (chatId: string) => void;
  deleteChat: (chatId: string) => void;
  updateChatTitle: (chatId: string, title: string) => void;
  
  // История текущего чата
  messages: ChatMessage[];
  addMessage: (message: ChatMessage) => void;
  clearMessages: () => void;
  
  // Методы для работы с курсами
  createCourse: (course: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>) => string;
  selectCourse: (courseId: string) => void;
  deleteCourse: (courseId: string) => void;
  updateCourse: (courseId: string, course: Partial<Course>) => void;
  createCourseChat: (courseId: string) => void;
  updateCourseProgress: (chatId: string, progress: CourseProgress) => void;
  
  // Методы для работы с аутентификацией
  setUser: (user: User | null) => void;
  setLoading: (isLoading: boolean) => void;
  fetchUser: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  logout: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
  chats: [],
  currentChatId: null,
  messages: [],
  courses: [],
  currentCourseId: null,
  
  // Auth state
  user: null,
  isAuthenticated: false,
  isLoading: true,
  

  createGeneralChat: () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: 'Общий чат',
      messages: [],
      createdAt: new Date(),
      type: 'general',
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
        ? (newChats.length > 0 ? newChats[0]?.id || null : null)
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
      // Если нет активного чата и это сообщение пользователя о создании курса, создаем временный чат
      if (!state.currentChatId && message.role === 'user') {
        const newChat: Chat = {
          id: Date.now().toString(),
          title: 'Создание курса',
          messages: [message],
          createdAt: new Date(),
          type: 'general',
        };
        
        return {
          chats: [newChat, ...state.chats],
          currentChatId: newChat.id,
          messages: [message],
        };
      }
      
      if (!state.currentChatId) {
        console.warn('Нет активного чата.');
        return state;
      }
      
      // Обновляем существующий чат
      const updatedMessages = [...state.messages, message];
      const updatedChats = state.chats.map(chat => {
        if (chat.id === state.currentChatId) {
          return { ...chat, messages: updatedMessages };
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
  
  // Методы для работы с курсами
  createCourse: (course) => {
    const newCourse: Course = {
      ...course,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    set((state) => ({
      courses: [newCourse, ...state.courses],
      currentCourseId: newCourse.id,
    }));
    
    // Автоматически создаем чат для нового курса
    get().createCourseChat(newCourse.id);
    
    return newCourse.id;
  },
  
  selectCourse: (courseId: string) => {
    set({ currentCourseId: courseId });
  },
  
  deleteCourse: (courseId: string) => {
    set((state) => {
      const newCourses = state.courses.filter(c => c.id !== courseId);
      const newCurrentId = state.currentCourseId === courseId 
        ? (newCourses.length > 0 ? newCourses[0]?.id || null : null)
        : state.currentCourseId;
      
      // Удаляем также чат, связанный с этим курсом
      const newChats = state.chats.filter(chat => chat.courseId !== courseId);
      const deletedChat = state.chats.find(chat => chat.courseId === courseId);
      
      // Если удален текущий чат, выбираем первый доступный чат
      let newCurrentChatId = state.currentChatId;
      if (deletedChat && state.currentChatId === deletedChat.id) {
        newCurrentChatId = newChats.length > 0 && newChats[0] ? newChats[0].id : null;
      }
      
      return {
        courses: newCourses,
        currentCourseId: newCurrentId,
        chats: newChats,
        currentChatId: newCurrentChatId,
        messages: newCurrentChatId ? newChats.find(c => c.id === newCurrentChatId)?.messages || [] : [],
      };
    });
  },
  
  updateCourse: (courseId: string, updates: Partial<Course>) => {
    set((state) => ({
      courses: state.courses.map(course =>
        course.id === courseId 
          ? { ...course, ...updates, updatedAt: new Date() } 
          : course
      ),
    }));
  },
  
  createCourseChat: (courseId: string) => {
    const course = get().courses.find(c => c.id === courseId);
    if (!course) return;
    
    // Проверяем, нет ли уже чата для этого курса
    const existingChat = get().chats.find(c => c.courseId === courseId);
    if (existingChat) {
      // Если чат уже существует, просто выбираем его
      get().selectChat(existingChat.id);
      return;
    }
    
    const newChat: Chat = {
      id: Date.now().toString(),
      title: `Обучение: ${course.title}`,
      messages: [],
      createdAt: new Date(),
      type: 'course',
      courseId: courseId,
      courseProgress: {
        courseId: courseId,
        currentModuleIndex: 0,
        currentLessonIndex: 0,
        completedLessons: [],
      },
    };
    
    set((state) => ({
      chats: [newChat, ...state.chats],
      currentChatId: newChat.id,
      messages: [],
    }));
  },
  
  updateCourseProgress: (chatId: string, progress: CourseProgress) => {
    set((state) => ({
      chats: state.chats.map(chat =>
        chat.id === chatId && chat.type === 'course'
          ? { ...chat, courseProgress: progress }
          : chat
      ),
    }));
  },
  
  // Методы для работы с аутентификацией
  setUser: (user: User | null) => {
    set({
      user,
      isAuthenticated: !!user,
    });
  },
  
  setLoading: (isLoading: boolean) => {
    set({ isLoading });
  },
  
  fetchUser: async () => {
    set({ isLoading: true });
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        set({
          user: data.data,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },
  
  updateUser: async (updates: Partial<User>) => {
    const currentUser = get().user;
    if (!currentUser) return;
    
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      if (response.ok) {
        const data = await response.json();
        set({ user: data.data });
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Failed to update user:', error);
      throw error;
    }
  },
  
  logout: () => {
    set({
      user: null,
      isAuthenticated: false,
    });
  },
    }),
    {
      name: 'socrademy-storage',
      partialize: (state) => ({
        chats: state.chats,
        currentChatId: state.currentChatId,
        courses: state.courses,
        currentCourseId: state.currentCourseId,
      }),
    }
  )
);
