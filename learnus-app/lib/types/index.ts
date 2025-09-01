// Базовые типы для учебной программы
export interface LearningProgram {
  id: number;
  title: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

// Статусы узлов
export type NodeStatus = 'not_started' | 'in_progress' | 'completed';

// Типы для узлов программы
export interface ProgramNode {
  id: string;
  program_id: number;
  parent_id?: number | null;
  title: string;
  description?: string | null;
  content?: string | null;
  position: {
    x: number;
    y: number;
  };
  status: NodeStatus;
  created_at: string;
  updated_at?: string;
}

// Роли в чате
export type ChatRole = 'user' | 'assistant' | 'system';

// Типы для сообщений чата
export interface ChatMessage {
  id?: number;
  node_id?: number;
  role: ChatRole;
  content: string;
  created_at?: string;
}

// Типы для прогресса обучения
export interface LearningProgress {
  node_id: number;
  status: NodeStatus;
  completed_at?: string | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

// Типы для статистики программы
export interface ProgramStats {
  total: number;
  completed: number;
  inProgress: number;
  notStarted: number;
  completionPercentage: number;
}

// Типы для генерации программы
export interface GeneratedProgram {
  title: string;
  description: string;
  nodes: Array<{
    title: string;
    description: string;
  }>;
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

// Типы для пагинации
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Типы для фильтрации и сортировки
export interface FilterParams {
  search?: string;
  status?: NodeStatus;
  programId?: number;
}

export interface SortParams {
  field: string;
  order: 'asc' | 'desc';
}

// Типы для режимов просмотра
export type ViewMode = 'chat' | 'table' | 'kanban' | 'list';

// Типы для темы оформления
export type Theme = 'light' | 'dark' | 'system';

// Типы для настроек пользователя
export interface UserPreferences {
  theme: Theme;
  defaultViewMode: ViewMode;
  showCompletedNodes: boolean;
  enableNotifications: boolean;
  autoSaveInterval: number; // в секундах
}

// Типы для уведомлений
export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number; // в миллисекундах
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Типы для дерева узлов
export interface TreeNode extends ProgramNode {
  children?: TreeNode[];
  expanded?: boolean;
  level?: number;
}

// Типы для операций drag & drop
export interface DragItem {
  id: string;
  type: 'node';
  data: ProgramNode;
}

export interface DropResult {
  targetId?: string;
  position: 'before' | 'after' | 'inside';
}

// Типы для истории изменений
export interface HistoryEntry {
  id: string;
  timestamp: string;
  action: 'create' | 'update' | 'delete' | 'move' | 'link' | 'unlink';
  entityType: 'program' | 'node' | 'progress';
  entityId: string | number;
  changes?: Record<string, any>;
  userId?: string;
}

// Типы для экспорта/импорта
export interface ExportData {
  version: string;
  exportedAt: string;
  programs: LearningProgram[];
  nodes: ProgramNode[];
  progress?: LearningProgress[];
  chatHistory?: ChatMessage[];
}

// Типы для коллаборации (будущее расширение)
export interface Collaborator {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'editor' | 'viewer';
  avatar?: string;
  lastActive?: string;
}

// Типы для аналитики
export interface LearningAnalytics {
  programId: number;
  userId?: string;
  totalTimeSpent: number; // в минутах
  averageSessionDuration: number; // в минутах
  completionRate: number; // процент
  mostActiveHours: number[]; // часы дня (0-23)
  streakDays: number;
  lastActivityDate: string;
}

// Type guards для проверки типов
export function isLearningProgram(obj: any): obj is LearningProgram {
  return (
    obj &&
    typeof obj.id === 'number' &&
    typeof obj.title === 'string' &&
    typeof obj.created_at === 'string'
  );
}

export function isProgramNode(obj: any): obj is ProgramNode {
  return (
    obj &&
    typeof obj.id === 'string' &&
    typeof obj.program_id === 'number' &&
    typeof obj.title === 'string' &&
    obj.position &&
    typeof obj.position.x === 'number' &&
    typeof obj.position.y === 'number'
  );
}

export function isNodeStatus(value: any): value is NodeStatus {
  return ['not_started', 'in_progress', 'completed'].includes(value);
}

export function isChatRole(value: any): value is ChatRole {
  return ['user', 'assistant', 'system'].includes(value);
}
