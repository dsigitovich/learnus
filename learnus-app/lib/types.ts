export interface LearningProgram {
  id: number;
  title: string;
  description?: string;
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
