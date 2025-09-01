import { useCallback, useState } from 'react';
import { useStore } from '@/lib/store';
import { chatService } from '@/lib/services';
import { ChatMessage } from '@/lib/types';

export function useChat() {
  const { messages, addMessage, clearMessages } = useStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Отправка сообщения
  const sendMessage = useCallback(
    async (content: string) => {
      // Добавляем сообщение пользователя
      const userMessage: ChatMessage = {
        role: 'user',
        content,
        created_at: new Date().toISOString(),
      };
      addMessage(userMessage);

      setIsLoading(true);
      setError(null);

      try {
        // Подготавливаем сообщения для отправки
        const messagesToSend = [...messages, userMessage];

        // Отправляем запрос
        const reply = await chatService.sendMessage({
          messages: messagesToSend,
        });

        // Добавляем ответ ассистента
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: reply,
          created_at: new Date().toISOString(),
        };
        addMessage(assistantMessage);

        return reply;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Произошла ошибка при отправке сообщения';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [messages, addMessage]
  );

  // Загрузка истории чата
  const loadChatHistory = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const history = await chatService.getChatHistory();
      history.forEach(msg => addMessage(msg));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Не удалось загрузить историю чата';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [addMessage]);

  // Очистка чата
  const clearChat = useCallback(async () => {
    try {
      await chatService.clearChatHistory();
      clearMessages();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Не удалось очистить чат';
      setError(errorMessage);
    }
  }, [clearMessages]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    loadChatHistory,
    clearChat,
  };
}