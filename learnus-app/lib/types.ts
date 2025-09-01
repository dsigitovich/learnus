export interface LearningProgram {
  id: number;
  title: string;
  description?: string;
  current_node_id?: number;
  created_at: string;
  updated_at: string;
}

export interface ProgramNode {
  id: string;
  program_id: number;
  parent_id?: number;
  title: string;
  description?: string;
  content?: string;
  position: {
    x: number;
    y: number;
  };
  status: 'not_started' | 'in_progress' | 'completed';
  created_at: string;
}

export interface ChatMessage {
  id?: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at?: string;
}

export interface LearningProgress {
  node_id: number;
  status: 'not_started' | 'in_progress' | 'completed';
  completed_at?: string;
  notes?: string;
}

export interface NodeProgress {
  id?: number;
  node_id: number;
  percentage: number;
  time_spent_minutes: number;
  last_accessed?: string;
  notes?: string;
}

export interface LearningSession {
  id: number;
  program_id: number;
  node_id: number;
  started_at: string;
  ended_at?: string;
  duration_minutes?: number;
}
