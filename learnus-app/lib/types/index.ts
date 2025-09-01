// Роли в чате
export type ChatRole = 'user' | 'assistant' | 'system';

// Типы для сообщений чата
export interface ChatMessage {
  id?: number;
  role: ChatRole;
  content: string;
  created_at?: string;
}

// Типы для API ответов
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  details?: any;
}

export interface ApiError {
  error: string;
  details?: any;
}

// Типы для системы обучения
export type LearningLevel = 'beginner' | 'intermediate' | 'advanced';
export type CourseLength = 'short' | 'medium' | 'long';
export type LearningStyle = 'questions' | 'practice' | 'theory';
export type SessionType = 'introduction' | 'learning' | 'practice' | 'reflection';
export type BlockDifficulty = 'easy' | 'medium' | 'hard';

export interface CourseConfig {
  topic: string;
  level: LearningLevel;
  goal: string;
  length: CourseLength;
  style: LearningStyle;
}

export interface CourseBlock {
  id: string;
  type: SessionType;
  title: string;
  content?: string;
  questions?: Question[];
  difficulty?: BlockDifficulty;
  order: number;
}

export interface Question {
  id: string;
  text: string;
  hint?: string;
  expectedAnswer?: string;
}

export interface Course {
  id: string;
  config: CourseConfig;
  blocks: CourseBlock[];
  createdAt: string;
  updatedAt: string;
}

export interface LearningSession {
  id: string;
  courseId: string;
  currentBlockId: string;
  currentQuestionIndex: number;
  progress: number;
  insights: Insight[];
  startedAt: string;
  completedAt?: string;
}

export interface Insight {
  id: string;
  sessionId: string;
  blockId: string;
  type: 'new_understanding' | 'conclusion' | 'difficulty';
  content: string;
  createdAt: string;
}

export interface UserProgress {
  courseId: string;
  completedBlocks: string[];
  totalInsights: number;
  progressPercentage: number;
  lastActiveAt: string;
}