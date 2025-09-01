import { NextRequest, NextResponse } from 'next/server';
import { openDb } from '@/lib/db';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: courseId } = await params;
    const db = await openDb();
    
    // Ищем активную сессию
    const activeSession = await db.get(
      'SELECT id FROM learning_sessions WHERE course_id = ? AND completed_at IS NULL ORDER BY started_at DESC LIMIT 1',
      [courseId]
    );

    if (activeSession) {
      await db.close();
      return NextResponse.json({
        data: { sessionId: activeSession.id }
      });
    }

    // Если нет активной сессии, создаем новую
    const { v4: uuidv4 } = require('uuid');
    const sessionId = uuidv4();

    // Получаем прогресс и находим следующий незавершенный блок
    const progress = await db.get(
      'SELECT completed_blocks FROM user_course_progress WHERE course_id = ?',
      [courseId]
    );

    const completedBlocks = JSON.parse(progress?.completed_blocks || '[]');

    const nextBlock = await db.get(
      `SELECT id FROM course_blocks 
       WHERE course_id = ? 
       AND id NOT IN (${completedBlocks.map(() => '?').join(',') || "''"})
       ORDER BY order_index 
       LIMIT 1`,
      [courseId, ...completedBlocks]
    );

    if (!nextBlock) {
      // Все блоки завершены
      await db.close();
      return NextResponse.json(
        { error: 'Курс уже завершен' },
        { status: 400 }
      );
    }

    await db.run(
      `INSERT INTO learning_sessions (id, course_id, current_block_id, current_question_index, progress) 
       VALUES (?, ?, ?, 0, ?)`,
      [sessionId, courseId, nextBlock.id, progress?.progress_percentage || 0]
    );

    await db.close();

    return NextResponse.json({
      data: { sessionId }
    });
  } catch (error) {
    console.error('Error continuing course:', error);
    return NextResponse.json(
      { error: 'Ошибка продолжения курса' },
      { status: 500 }
    );
  }
}