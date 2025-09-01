import { useCallback, useEffect } from 'react';
import { useProgramStore } from '@/store';
import { programService } from '@/lib/services';
import { LearningProgram } from '@/lib/types';

export function usePrograms() {
  const {
    programs,
    isLoading,
    error,
    setPrograms,
    setLoading,
    setError,
  } = useProgramStore();

  // Загрузка всех программ
  const fetchPrograms = useCallback(async () => {
    setLoading(true);
    try {
      const data = await programService.getAllPrograms();
      setPrograms(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch programs');
    } finally {
      setLoading(false);
    }
  }, [setPrograms, setLoading, setError]);

  // Создание новой программы
  const createProgram = useCallback(
    async (data: { title: string; description?: string }) => {
      setLoading(true);
      try {
        const program = await programService.createProgram(data);
        useProgramStore.getState().addProgram(program);
        return program;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create program');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError]
  );

  // Обновление программы
  const updateProgram = useCallback(
    async (id: number, updates: Partial<LearningProgram>) => {
      setLoading(true);
      try {
        const program = await programService.updateProgram(id, updates);
        useProgramStore.getState().updateProgram(id, program);
        return program;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update program');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError]
  );

  // Удаление программы
  const deleteProgram = useCallback(
    async (id: number) => {
      setLoading(true);
      try {
        await programService.deleteProgram(id);
        useProgramStore.getState().deleteProgram(id);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete program');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError]
  );

  // Загрузка программ при монтировании
  useEffect(() => {
    if (programs.length === 0 && !isLoading) {
      fetchPrograms();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    programs,
    isLoading,
    error,
    fetchPrograms,
    createProgram,
    updateProgram,
    deleteProgram,
  };
}

// Хук для работы с текущей программой
export function useCurrentProgram() {
  const {
    currentProgram,
    nodes,
    selectedNode,
    setCurrentProgram,
    setNodes,
    setSelectedNode,
    setLoading,
    setError,
  } = useProgramStore();

  // Загрузка программы с узлами
  const loadProgram = useCallback(
    async (id: number) => {
      setLoading(true);
      try {
        const program = await programService.getProgramById(id);
        if (!program) {
          throw new Error('Program not found');
        }
        
        const programNodes = await programService.getProgramNodes(id);
        
        setCurrentProgram(program);
        setNodes(programNodes);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load program');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setCurrentProgram, setNodes, setLoading, setError]
  );

  // Очистка текущей программы
  const clearCurrentProgram = useCallback(() => {
    setCurrentProgram(null);
    setNodes([]);
    setSelectedNode(null);
  }, [setCurrentProgram, setNodes, setSelectedNode]);

  return {
    currentProgram,
    nodes,
    selectedNode,
    loadProgram,
    clearCurrentProgram,
    setSelectedNode,
  };
}