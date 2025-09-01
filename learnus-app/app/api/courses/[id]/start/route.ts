import { NextRequest, NextResponse } from 'next/server';
import { openDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: courseId } = await params;
    const db = await openDb();
    
    // Проверяем существование курса
    const course = await db.get(
      'SELECT id FROM courses WHERE id = ?',
      [courseId]
    );

    if (!course) {
      await db.close();
      return NextResponse.json(
        { error: 'Курс не найден' },
        { status: 404 }
      );
    }

    // Получаем первый блок курса
    const firstBlock = await db.get(
      'SELECT id FROM course_blocks WHERE course_id = ? ORDER BY order_index LIMIT 1',
      [courseId]
    );

    if (!firstBlock) {
      await db.close();
      return NextResponse.json(
        { error: 'В курсе нет блоков' },
        { status: 400 }
      );
    }

    // Создаем новую сессию
    const sessionId = uuidv4();
    
    await db.run(
      `INSERT INTO learning_sessions (id, course_id, current_block_id, current_question_index, progress) 
       VALUES (?, ?, ?, 0, 0)`,
      [sessionId, courseId, firstBlock.id]
    );

    await db.close();

    return NextResponse.json({
      data: { sessionId }
    });
  } catch (error) {
    console.error('Error starting course:', error);
    return NextResponse.json(
      { error: 'Ошибка начала курса' },
      { status: 500 }
    );
  }
}