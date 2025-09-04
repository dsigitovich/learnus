import { NextRequest, NextResponse } from 'next/server';
import { TrackLessonProgressUseCase } from '@application/use-cases/TrackLessonProgressUseCase';
import { ProgressRepository } from '@infrastructure/database/ProgressRepository';
import { LessonProgressStatus } from '@domain/value-objects/LessonProgress';
import Database from 'better-sqlite3';
import { z } from 'zod';

// Валидация входных данных
const TrackProgressSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  moduleId: z.string().min(1, 'Module ID is required'),
  lessonId: z.string().min(1, 'Lesson ID is required'),
  status: z.enum(['not_started', 'in_progress', 'completed']),
  timeSpent: z.number().min(0, 'Time spent cannot be negative'),
  completedAt: z.string().datetime().optional(),
});

type TrackProgressRequest = z.infer<typeof TrackProgressSchema>;

export async function POST(request: NextRequest) {
  try {
    // Парсинг и валидация входных данных
    const body = await request.json();
    const validationResult = TrackProgressSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validationResult.error.errors 
        },
        { status: 400 }
      );
    }

    const data: TrackProgressRequest = validationResult.data;

    // Инициализация зависимостей
    // TODO: Заменить на dependency injection container
    const db = new Database('./learnus.db');
    const progressRepository = new ProgressRepository(db);
    const useCase = new TrackLessonProgressUseCase(progressRepository);

    // Выполнение use case
    const result = await useCase.execute({
      userId: data.userId,
      moduleId: data.moduleId,
      lessonId: data.lessonId,
      status: data.status as LessonProgressStatus,
      timeSpent: data.timeSpent,
      completedAt: data.completedAt ? new Date(data.completedAt) : undefined,
    });

    if (result.isFailure) {
      return NextResponse.json(
        { error: result.getError().message },
        { status: 400 }
      );
    }

    const response = result.getValue();
    
    return NextResponse.json({
      success: true,
      data: {
        progressId: response.progressId,
        lessonProgress: {
          lessonId: response.lessonProgress.lessonId,
          status: response.lessonProgress.status,
          timeSpent: response.lessonProgress.timeSpent,
          completedAt: response.lessonProgress.completedAt?.toISOString(),
          attempts: response.lessonProgress.attempts,
        }
      },
      message: 'Progress tracked successfully'
    });

  } catch (error) {
    console.error('Error tracking progress:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json(
    { 
      message: 'Use POST method to track lesson progress',
      endpoints: {
        'POST /api/progress/track': 'Track lesson progress',
        'GET /api/progress/user/{userId}': 'Get user progress',
        'GET /api/progress/module/{moduleId}': 'Calculate module progress'
      }
    },
    { status: 405 }
  );
}