import { useCallback, useRef } from 'react';
import { useChatStore, useProgramStore } from '@/store';
import { chatService } from '@/lib/services';
import { ChatMessage } from '@/lib/types';

export function useChat() {
  const {
    messages,
    isTyping,
    error,
    setMessages,
    addMessage,
    clearMessages,
    setTyping,
    setError,
  } = useChatStore();

  const { selectedNode } = useProgramStore();
  const abortControllerRef = useRef<AbortController | null>(null);

  // Отправка сообщения
  const sendMessage = useCallback(
    async (content: string) => {
      // Отменяем предыдущий запрос, если он есть
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Создаем новый контроллер для отмены
      abortControllerRef.current = new AbortController();

      // Добавляем сообщение пользователя
      const userMessage: ChatMessage = {
        role: 'user',
        content,
        created_at: new Date().toISOString(),
      };
      addMessage(userMessage);

      setTyping(true);
      setError(null);

      try {
        // Подготавливаем сообщения для отправки
        const messagesToSend = [...messages, userMessage];

        // Отправляем запрос
        const reply = await chatService.sendMessage({
          messages: messagesToSend,
          nodeId: selectedNode ? Number(selectedNode.id) : undefined,
          nodeContent: selectedNode?.content,
        });

        // Добавляем ответ ассистента
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: reply,
          created_at: new Date().toISOString(),
        };
        addMessage(assistantMessage);

        return assistantMessage;
      } catch (err) {
        // Игнорируем ошибки отмены
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }

        const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
        setError(errorMessage);
        
        // Добавляем сообщение об ошибке в чат
        addMessage({
          role: 'assistant',
          content: `Ошибка: ${errorMessage}`,
          created_at: new Date().toISOString(),
        });
        
        throw err;
      } finally {
        setTyping(false);
        abortControllerRef.current = null;
      }
    },
    [messages, selectedNode, addMessage, setTyping, setError]
  );

  // Загрузка истории чата для узла
  const loadChatHistory = useCallback(
    async (nodeId: number) => {
      try {
        const history = await chatService.getChatHistory(nodeId);
        setMessages(history);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load chat history');
      }
    },
    [setMessages, setError]
  );

  // Очистка чата
  const clearChat = useCallback(() => {
    clearMessages();
    setError(null);
  }, [clearMessages, setError]);

  // Отмена текущего запроса
  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setTyping(false);
    }
  }, [setTyping]);

  // Генерация программы
  const generateProgram = useCallback(
    async (topic: string, autoCreate = false) => {
      try {
        const response = await fetch('/api/programs/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic, autoCreate }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to generate program');
        }

        const result = await response.json();
        return result.data;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to generate program';
        setError(errorMessage);
        throw err;
      }
    },
    [setError]
  );

  return {
    messages,
    isTyping,
    error,
    sendMessage,
    loadChatHistory,
    clearChat,
    cancelRequest,
    generateProgram,
  };
}