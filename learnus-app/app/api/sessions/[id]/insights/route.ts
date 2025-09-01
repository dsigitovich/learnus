import { NextRequest, NextResponse } from 'next/server';
import { openDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: sessionId } = await params;
    const { insights } = await request.json();
    const db = await openDb();
    
    // Получаем сессию
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

    // Сохраняем инсайты
    for (const insight of insights) {
      await db.run(
        `INSERT INTO insights (id, session_id, block_id, type, content) 
         VALUES (?, ?, ?, ?, ?)`,
        [uuidv4(), sessionId, session.current_block_id, insight.type, insight.content]
      );
    }

    // Обновляем счетчик инсайтов
    const totalInsights = await db.get(
      'SELECT COUNT(*) as count FROM insights WHERE session_id IN (SELECT id FROM learning_sessions WHERE course_id = ?)',
      [session.course_id]
    );

    await db.run(
      'UPDATE user_course_progress SET total_insights = ? WHERE course_id = ?',
      [totalInsights.count, session.course_id]
    );

    await db.close();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving insights:', error);
    return NextResponse.json(
      { error: 'Ошибка сохранения инсайтов' },
      { status: 500 }
    );
  }
}