import { useCallback, useEffect } from 'react';
import { useProgressStore, useProgramStore } from '@/store';
import { progressService } from '@/lib/services';
import { NodeStatus, LearningProgress } from '@/lib/types';

export function useProgress() {
  const {
    progress,
    stats,
    isLoading,
    error,
    setProgress,
    setAllProgress,
    resetProgress,
    setStats,
    setLoading,
    setError,
    getNodeProgress,
    isNodeCompleted,
  } = useProgressStore();

  const { currentProgram } = useProgramStore();

  // Загрузка прогресса для программы
  const loadProgramProgress = useCallback(
    async (programId: number) => {
      setLoading(true);
      try {
        const progressMap = await progressService.getProgramProgress(programId);
        setAllProgress(progressMap);
        
        // Загружаем статистику
        const programStats = await progressService.getProgramStats(programId);
        setStats(programStats);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load progress');
      } finally {
        setLoading(false);
      }
    },
    [setAllProgress, setStats, setLoading, setError]
  );

  // Обновление статуса узла
  const updateProgress = useCallback(
    async (nodeId: number, status: NodeStatus, notes?: string) => {
      setLoading(true);
      try {
        const updatedProgress = await progressService.updateProgress({
          nodeId,
          status,
          notes,
        });
        
        setProgress(nodeId, updatedProgress);
        
        // Обновляем статистику, если есть текущая программа
        if (currentProgram) {
          const programStats = await progressService.getProgramStats(currentProgram.id);
          setStats(programStats);
        }
        
        return updatedProgress;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update progress');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentProgram, setProgress, setStats, setLoading, setError]
  );

  // Сброс прогресса программы
  const resetProgramProgress = useCallback(
    async (programId: number) => {
      setLoading(true);
      try {
        await progressService.resetProgramProgress(programId);
        resetProgress();
        
        // Обновляем статистику
        const programStats = await progressService.getProgramStats(programId);
        setStats(programStats);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to reset progress');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [resetProgress, setStats, setLoading, setError]
  );

  // Получение следующего узла для изучения
  const getNextNode = useCallback(
    async (programId: number) => {
      try {
        const node = await progressService.getNextNode(programId);
        return node;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to get next node');
        return null;
      }
    },
    [setError]
  );

  // Загрузка прогресса при изменении программы
  useEffect(() => {
    if (currentProgram && !isLoading) {
      loadProgramProgress(currentProgram.id);
    }
  }, [currentProgram?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    progress,
    stats,
    isLoading,
    error,
    loadProgramProgress,
    updateProgress,
    resetProgramProgress,
    getNextNode,
    getNodeProgress,
    isNodeCompleted,
  };
}

// Хук для работы с прогрессом конкретного узла
export function useNodeProgress(nodeId: number | string) {
  const numericNodeId = typeof nodeId === 'string' ? parseInt(nodeId, 10) : nodeId;
  const { getNodeProgress, updateNodeStatus } = useProgressStore();
  const { updateProgress } = useProgress();

  const progress = getNodeProgress(numericNodeId);
  const status = progress?.status || 'not_started';
  const notes = progress?.notes || '';
  const completedAt = progress?.completed_at;

  const setStatus = useCallback(
    async (newStatus: NodeStatus, newNotes?: string) => {
      // Сначала обновляем локально для быстрого UI
      updateNodeStatus(numericNodeId, newStatus, newNotes);
      
      try {
        // Затем синхронизируем с сервером
        await updateProgress(numericNodeId, newStatus, newNotes);
      } catch (err) {
        // Откатываем изменения при ошибке
        updateNodeStatus(numericNodeId, status, notes);
        throw err;
      }
    },
    [numericNodeId, status, notes, updateNodeStatus, updateProgress]
  );

  const markAsStarted = useCallback(() => setStatus('in_progress'), [setStatus]);
  const markAsCompleted = useCallback(() => setStatus('completed'), [setStatus]);
  const markAsNotStarted = useCallback(() => setStatus('not_started'), [setStatus]);

  return {
    status,
    notes,
    completedAt,
    setStatus,
    markAsStarted,
    markAsCompleted,
    markAsNotStarted,
  };
}
