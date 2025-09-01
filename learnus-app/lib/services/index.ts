export { programService, ProgramService } from './program-service';
export { chatService, ChatService } from './chat-service';
export { progressService, ProgressService } from './progress-service';
export { nodeService, NodeService } from './node-service';

// Экспорт типов для валидации
export type {
  CreateProgramData,
  UpdateProgramData,
} from './program-service';

export type {
  SendMessageData,
} from './chat-service';

export type {
  UpdateProgressData,
} from './progress-service';

export type {
  CreateNodeData,
  UpdateNodeData,
} from './node-service';
