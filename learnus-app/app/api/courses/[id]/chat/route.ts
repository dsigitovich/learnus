import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { container } from '@/src/shared/container/container';
import { IAIService } from '@/src/application/interfaces/IAIService';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const courseId = params.id;
    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { message, lessonId } = body;

    if (!message || message.trim() === '') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Get AI service from container
    const aiService = container.resolve<IAIService>('IAIService');
    
    // Create context-aware prompt for course chat
    const systemPrompt = `Ты - AI-помощник для изучения курса. Твоя задача - помочь студенту понять материал курса, ответить на вопросы и дать полезные советы.

Контекст:
- Курс ID: ${courseId}
- Пользователь: ${session.user.name || session.user.email}
- Урок ID: ${lessonId || 'общий вопрос по курсу'}

Инструкции:
1. Отвечай на русском языке
2. Будь дружелюбным и поддерживающим
3. Давай конкретные и полезные советы
4. Если вопрос не связан с курсом, вежливо перенаправь разговор к теме курса
5. Используй примеры и аналогии для лучшего понимания
6. Поощряй студента продолжать обучение`;

    const response = await aiService.generateResponse(message, systemPrompt);

    return NextResponse.json({
      success: true,
      response: response,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in course chat:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const courseId = params.id;
    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      );
    }

    // For now, return empty chat history
    // In the future, this could be extended to store and retrieve chat history
    return NextResponse.json({
      success: true,
      messages: [],
      courseId,
    });
  } catch (error) {
    console.error('Error getting chat history:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}