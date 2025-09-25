'use client';

import { useState, useMemo } from 'react';
import { Course, CourseProgressTodo, ProgressTodoItem, CourseProgress } from '@/lib/types';

interface UseCourseProgressReturn {
  progressTodo: CourseProgressTodo | null;
  isLoading: boolean;
  markAsCompleted: (itemId: string) => void;
  markAsIncomplete: (itemId: string) => void;
  refreshProgress: () => void;
}

export function useCourseProgress(course: Course | null, currentProgress?: CourseProgress): UseCourseProgressReturn {
  const [isLoading, setIsLoading] = useState(false);

  const progressTodo = useMemo(() => {
    if (!course) return null;

    const items: ProgressTodoItem[] = [];
    let completedCount = 0;

    // Добавляем уроки из каждого модуля
    course.modules.forEach((module, moduleIndex) => {
      module.lessons.forEach((lesson, lessonIndex) => {
        const itemId = `${moduleIndex}:${lessonIndex}`;
        const isCompleted = currentProgress?.completedLessons.includes(itemId) || false;
        const isAvailable = moduleIndex === 0 || 
          (currentProgress && moduleIndex <= currentProgress.currentModuleIndex) || false;

        if (isCompleted) completedCount++;

        items.push({
          id: itemId,
          type: 'lesson',
          title: lesson.title,
          moduleIndex,
          lessonIndex,
          isCompleted,
          isAvailable
        });
      });

      // Добавляем рефлексивный опрос модуля
      const quizId = `quiz:${moduleIndex}`;
      const isQuizCompleted = currentProgress?.completedLessons.includes(quizId) || false;
      const isQuizAvailable = moduleIndex === 0 || 
        (currentProgress && moduleIndex <= currentProgress.currentModuleIndex) || false;

      if (isQuizCompleted) completedCount++;

      items.push({
        id: quizId,
        type: 'module_quiz',
        title: `Рефлексивный опрос модуля ${moduleIndex + 1}`,
        moduleIndex,
        isCompleted: isQuizCompleted,
        isAvailable: isQuizAvailable
      });
    });

    // Добавляем финальное задание курса
    const finalAssessmentId = 'final_assessment';
    const isFinalCompleted = currentProgress?.completedLessons.includes(finalAssessmentId) || false;
    const isFinalAvailable = (currentProgress && 
      currentProgress.currentModuleIndex >= course.modules.length - 1) || false;

    if (isFinalCompleted) completedCount++;

    items.push({
      id: finalAssessmentId,
      type: 'final_assessment',
      title: 'Итоговое задание курса',
      moduleIndex: course.modules.length - 1,
      isCompleted: isFinalCompleted,
      isAvailable: isFinalAvailable
    });

    const totalItems = items.length;
    const progressPercentage = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;

    return {
      courseId: course.id,
      items,
      totalItems,
      completedItems: completedCount,
      progressPercentage
    };
  }, [course, currentProgress]);

  const markAsCompleted = (itemId: string) => {
    // В реальном приложении здесь был бы API вызов
    console.log(`Marking item ${itemId} as completed`);
  };

  const markAsIncomplete = (itemId: string) => {
    // В реальном приложении здесь был бы API вызов
    console.log(`Marking item ${itemId} as incomplete`);
  };

  const refreshProgress = () => {
    setIsLoading(true);
    // В реальном приложении здесь был бы API вызов для обновления прогресса
    setTimeout(() => setIsLoading(false), 500);
  };

  return {
    progressTodo,
    isLoading,
    markAsCompleted,
    markAsIncomplete,
    refreshProgress
  };
}