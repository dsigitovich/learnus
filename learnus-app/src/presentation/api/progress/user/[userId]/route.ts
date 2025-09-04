import { NextRequest, NextResponse } from 'next/server';
import { GetUserProgressUseCase } from '@application/use-cases/GetUserProgressUseCase';
import { ProgressRepository } from '@infrastructure/database/ProgressRepository';
import Database from 'better-sqlite3';
import { z } from 'zod';

// Валидация параметров запроса
const GetUserProgressParamsSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
});

const GetUserProgressQuerySchema = z.object({
  moduleId: z.string().optional(),
  totalLessons: z.string().transform(val => val ? parseInt(val, 10) : undefined).optional(),
});

interface RouteParams {
  params: {
    userId: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Валидация параметров пути
    const paramsValidation = GetUserProgressParamsSchema.safeParse(params);
    if (!paramsValidation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid parameters', 
          details: paramsValidation.error.errors 
        },
        { status: 400 }
      );
    }

    // Валидация параметров запроса
    const { searchParams } = new URL(request.url);
    const queryValidation = GetUserProgressQuerySchema.safeParse({
      moduleId: searchParams.get('moduleId'),
      totalLessons: searchParams.get('totalLessons'),
    });

    if (!queryValidation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid query parameters', 
          details: queryValidation.error.errors 
        },
        { status: 400 }
      );
    }

    const { userId } = paramsValidation.data;
    const { moduleId, totalLessons } = queryValidation.data;

    // Инициализация зависимостей
    // TODO: Заменить на dependency injection container
    const db = new Database('./learnus.db');
    const progressRepository = new ProgressRepository(db);
    const useCase = new GetUserProgressUseCase(progressRepository);

    // Выполнение use case
    const result = await useCase.execute({
      userId,
      moduleId,
      totalLessonsInModule: totalLessons,
    });

    if (result.isFailure) {
      return NextResponse.json(
        { error: result.getError().message },
        { status: 400 }
      );
    }

    const response = result.getValue();
    
    // Форматирование ответа для фронтенда
    const formattedResponse = {
      userId: response.userId,
      moduleProgresses: response.moduleProgresses.map(mp => ({
        moduleId: mp.moduleId,
        progress: {
          completedLessons: mp.progress.completedLessons,
          totalLessons: mp.progress.totalLessons,
          completionPercentage: mp.progress.completionPercentage,
          isCompleted: mp.progress.isCompleted,
          totalTimeSpent: mp.progress.totalTimeSpent,
          formattedTimeSpent: mp.progress.getFormattedTimeSpent(),
        },
        startedAt: mp.startedAt.toISOString(),
        lastAccessedAt: mp.lastAccessedAt?.toISOString(),
        completedAt: mp.completedAt?.toISOString(),
        currentLessonId: mp.currentLessonId,
        nextLessonId: mp.nextLessonId,
      })),
      statistics: {
        ...response.statistics,
        formattedTotalTime: formatTime(response.statistics.totalTimeSpent),
        formattedAverageTime: formatTime(response.statistics.averageTimePerLesson),
      },
      overallProgress: {
        ...response.overallProgress,
        formattedTotalTime: formatTime(response.overallProgress.totalTimeSpent),
      },
    };
    
    return NextResponse.json({
      success: true,
      data: formattedResponse,
    });

  } catch (error) {
    console.error('Error getting user progress:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else if (minutes > 0) {
    return `${minutes}m`;
  } else {
    return '0m';
  }
}