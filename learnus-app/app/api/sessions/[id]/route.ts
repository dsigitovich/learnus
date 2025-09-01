import { NextRequest, NextResponse } from 'next/server';
import { openDb } from '@/lib/db';
import { LearningSession } from '@/lib/types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: sessionId } = await params;
    const db = await openDb();
    
    const session = await db.get(
      'SELECT * FROM learning_sessions WHERE id = ?',
      [sessionId]
    );

    if (!session) {
      await db.close();
      return NextResponse.json(
        { error: 'Сессия не найдена' },
        { status: 404 }
      );
    }

    // Получаем инсайты
    const insights = await db.all(
      'SELECT * FROM insights WHERE session_id = ? ORDER BY created_at',
      [sessionId]
    );

    await db.close();

    const sessionData: LearningSession = {
      id: session.id,
      courseId: session.course_id,
      currentBlockId: session.current_block_id,
      currentQuestionIndex: session.current_question_index,
      progress: session.progress,
      insights: insights.map(i => ({
        id: i.id,
        sessionId: i.session_id,
        blockId: i.block_id,
        type: i.type,
        content: i.content,
        createdAt: i.created_at
      })),
      startedAt: session.started_at,
      completedAt: session.completed_at
    };

    return NextResponse.json({ data: sessionData });
  } catch (error) {
    console.error('Error fetching session:', error);
    return NextResponse.json(
      { error: 'Ошибка получения сессии' },
      { status: 500 }
    );
  }
}