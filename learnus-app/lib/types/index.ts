// Роли в чате
export type ChatRole = 'user' | 'assistant' | 'system';

// Типы для AI рассуждений
export interface AIReasoningStep {
  id: string;
  description: string;
  emoji?: string;
}

// Типы для сообщений чата
export interface ChatMessage {
  id?: number;
  role: ChatRole;
  content: string;
  created_at?: string;
  reasoning?: AIReasoningStep[]; // Шаги рассуждений AI (только для assistant сообщений)
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

// Типы для курсов
export interface CourseLesson {
  title: string;
  type: 'theory' | 'exercise';
  content: string;
  prompts_for_user: string[];
  expected_outcome: string;
  hints?: string[];
}

export interface CourseModuleSummary {
  type: 'reflection_quiz';
  questions: string[];
}

export interface CourseModule {
  title: string;
  learning_objectives: string[];
  lessons: CourseLesson[];
  module_summary: CourseModuleSummary;
}

export interface CourseFinalAssessment {
  title: string;
  type: 'practical';
  content: string;
  expected_outcome: string;
}

export interface CourseSummary {
  final_assessment: CourseFinalAssessment[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  modules: CourseModule[];
  course_summary: CourseSummary;
  createdAt: Date;
  updatedAt: Date;
}

// Расширяем типы чатов для поддержки курсов
export type ChatType = 'general' | 'course';

export interface CourseProgress {
  courseId: string;
  currentModuleIndex: number;
  currentLessonIndex: number;
  completedLessons: string[]; // ID уроков в формате "module-index:lesson-index"
}