import { NextRequest, NextResponse } from 'next/server';
import { CalculateModuleProgressUseCase } from '@application/use-cases/CalculateModuleProgressUseCase';
import { ProgressRepository } from '@infrastructure/database/ProgressRepository';
import Database from 'better-sqlite3';
import { z } from 'zod';

// Валидация параметров запроса
const CalculateModuleProgressQuerySchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  moduleId: z.string().min(1, 'Module ID is required'),
  totalLessons: z.string().transform(val => parseInt(val, 10)).refine(val => val > 0, 'Total lessons must be greater than 0'),
});

export async function GET(request: NextRequest) {
  try {
    // Валидация параметров запроса
    const { searchParams } = new URL(request.url);
    const queryValidation = CalculateModuleProgressQuerySchema.safeParse({
      userId: searchParams.get('userId'),
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

    const { userId, moduleId, totalLessons } = queryValidation.data;

    // Инициализация зависимостей
    // TODO: Заменить на dependency injection container
    const db = new Database('./learnus.db');
    const progressRepository = new ProgressRepository(db);
    const useCase = new CalculateModuleProgressUseCase(progressRepository);

    // Выполнение use case
    const result = await useCase.execute({
      userId,
      moduleId,
      totalLessons,
    });

    if (result.isFailure) {
      return NextResponse.json(
        { error: result.getError().message },
        { status: 400 }
      );
    }

    const response = result.getValue();
    
    if (!response) {
      return NextResponse.json({
        success: true,
        data: null,
        message: 'No progress found for this module'
      });
    }

    // Форматирование ответа для фронтенда
    const formattedResponse = {
      moduleId: response.moduleId,
      progress: {
        completedLessons: response.progress.completedLessons,
        totalLessons: response.progress.totalLessons,
        completionPercentage: response.progress.completionPercentage,
        isCompleted: response.progress.isCompleted,
        totalTimeSpent: response.progress.totalTimeSpent,
        formattedTimeSpent: response.progress.getFormattedTimeSpent(),
        remainingLessons: response.progress.getRemainingLessons(),
        progressLevel: response.progress.getProgressLevel(),
      },
      estimatedTimeRemaining: response.estimatedTimeRemaining,
      recommendedNextAction: response.recommendedNextAction,
      currentLessonId: response.currentLessonId,
      nextLessonId: response.nextLessonId,
      recommendations: this.getRecommendations(response.recommendedNextAction, response.progress.completionPercentage),
    };
    
    return NextResponse.json({
      success: true,
      data: formattedResponse,
    });

  } catch (error) {
    console.error('Error calculating module progress:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function getRecommendations(action: string, completionPercentage: number): string[] {
  const recommendations: string[] = [];

  switch (action) {
    case 'start_next_lesson':
      recommendations.push('Ready to start your next lesson!');
      if (completionPercentage > 50) {
        recommendations.push('You\'re over halfway through this module. Keep it up!');
      }
      break;
    
    case 'continue_current_lesson':
      recommendations.push('Continue with your current lesson to maintain momentum.');
      break;
    
    case 'review_completed':
      recommendations.push('Consider reviewing completed lessons to reinforce your learning.');
      break;
    
    case 'module_completed':
      recommendations.push('Congratulations! You\'ve completed this module.');
      recommendations.push('Consider starting the next module or reviewing key concepts.');
      break;
  }

  // Дополнительные рекомендации на основе прогресса
  if (completionPercentage >= 25 && completionPercentage < 50) {
    recommendations.push('You\'re making good progress. Try to maintain a consistent study schedule.');
  } else if (completionPercentage >= 75 && completionPercentage < 100) {
    recommendations.push('Almost there! You\'re in the final stretch of this module.');
  }

  return recommendations;
}