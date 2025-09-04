import { OpenAIService } from '../OpenAIService';
import { Result } from '@shared/types/result';

// Mock OpenAI
const mockCreate = jest.fn();
jest.mock('openai', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: mockCreate
        }
      }
    }))
  };
});

describe('OpenAIService', () => {
  let openAIService: OpenAIService;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    mockCreate.mockClear();
    
    // Mock environment variable
    process.env.OPENAI_API_KEY = 'test-api-key';
    
    openAIService = new OpenAIService();
  });

  describe('chat', () => {
    it('should use Socratic prompt when user says "не знаю"', async () => {
      // Arrange
      const mockCompletion = {
        choices: [{
          message: {
            content: 'React - это библиотека для создания пользовательских интерфейсов. Она позволяет создавать переиспользуемые компоненты. Как вы думаете, зачем нужны компоненты в React?'
          }
        }]
      };

      mockCreate.mockResolvedValue(mockCompletion);

      // Act
      const result = await openAIService.chat('не знаю что такое React', '');

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(mockCreate).toHaveBeenCalledWith({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: expect.stringContaining('Socratic tutor')
          },
          {
            role: 'user',
            content: 'не знаю что такое React'
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      });

      const response = result.getValue();
      expect(response).toContain('React');
      expect(response).toContain('компоненты');
    });

    it('should include course context when provided', async () => {
      // Arrange
      const mockCompletion = {
        choices: [{
          message: {
            content: 'Отлично! Теперь давайте разберем основы React в контексте вашего курса.'
          }
        }]
      };

      mockCreate.mockResolvedValue(mockCompletion);

      const context = JSON.stringify({
        courseTitle: 'React для начинающих',
        currentLesson: 'Введение в React',
        learningObjectives: ['Понять основы React', 'Создать первый компонент']
      });

      // Act
      const result = await openAIService.chat('Расскажи о React', context);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(mockCreate).toHaveBeenCalledWith({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: expect.stringContaining('React для начинающих')
          },
          {
            role: 'user',
            content: 'Расскажи о React'
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      });
    });

    it('should handle API errors gracefully', async () => {
      // Arrange
      mockCreate.mockRejectedValue(new Error('API Error'));

      // Act
      const result = await openAIService.chat('тест', '');

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toBe('API Error');
    });

    it('should handle empty response from OpenAI', async () => {
      // Arrange
      const mockCompletion = {
        choices: [{
          message: {
            content: null
          }
        }]
      };

      mockCreate.mockResolvedValue(mockCompletion);

      // Act
      const result = await openAIService.chat('тест', '');

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toBe('No response from OpenAI');
    });
  });
});
