import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ChatMessage, Course, ChatType, CourseProgress } from './types';

interface Chat {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  type: ChatType;
  courseId?: string; // Если это чат курса, то здесь ID курса
  courseProgress?: CourseProgress; // Прогресс прохождения курса
}

interface AppState {
  // Чаты
  chats: Chat[];
  currentChatId: string | null;
  
  // Курсы
  courses: Course[];
  currentCourseId: string | null;
  
  // Методы для работы с чатами
  createNewChat: () => void;
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
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
  chats: [],
  currentChatId: null,
  messages: [],
  courses: [],
  currentCourseId: null,
  
  createNewChat: () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: 'Новый чат',
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
      // Если нет активного чата, создаем новый
      if (!state.currentChatId) {
        const newChat: Chat = {
          id: Date.now().toString(),
          title: message.content.slice(0, 30) + (message.content.length > 30 ? '...' : ''),
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
      // Убираем автоматический выбор созданного курса
      // currentCourseId: newCourse.id,
    }));
    
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
      
      // Удаляем также все чаты, связанные с этим курсом
      const newChats = state.chats.filter(chat => chat.courseId !== courseId);
      
      return {
        courses: newCourses,
        currentCourseId: newCurrentId,
        chats: newChats,
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
    }),
    {
      name: 'learnus-storage',
      partialize: (state) => ({
        chats: state.chats,
        currentChatId: state.currentChatId,
        courses: state.courses,
        currentCourseId: state.currentCourseId,
      }),
    }
  )
);
