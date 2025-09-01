import { NextRequest, NextResponse } from 'next/server';
import { openDb } from '@/lib/db';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: sessionId } = await params;
    const { answer } = await request.json();
    const db = await openDb();
    
    // Получаем текущую сессию
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

    // Получаем вопросы текущего блока
    const questions = await db.all(
      'SELECT COUNT(*) as total FROM questions WHERE block_id = ?',
      [session.current_block_id]
    );

    const totalQuestions = questions[0].total;
    const nextQuestionIndex = session.current_question_index + 1;

    if (nextQuestionIndex < totalQuestions) {
      // Переходим к следующему вопросу
      await db.run(
        'UPDATE learning_sessions SET current_question_index = ? WHERE id = ?',
        [nextQuestionIndex, sessionId]
      );
    } else {
      // Все вопросы блока пройдены
      await db.run(
        'UPDATE learning_sessions SET current_question_index = ? WHERE id = ?',
        [totalQuestions, sessionId]
      );
    }

    // Обновляем прогресс
    await updateProgress(db, sessionId, session.course_id);

    await db.close();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error submitting answer:', error);
    return NextResponse.json(
      { error: 'Ошибка отправки ответа' },
      { status: 500 }
    );
  }
}

async function updateProgress(db: any, sessionId: string, courseId: string) {
  // Подсчитываем общий прогресс
  const blocks = await db.all(
    'SELECT id FROM course_blocks WHERE course_id = ? ORDER BY order_index',
    [courseId]
  );

  const session = await db.get(
    'SELECT current_block_id, current_question_index FROM learning_sessions WHERE id = ?',
    [sessionId]
  );

  const currentBlockIndex = blocks.findIndex((b: any) => b.id === session.current_block_id);
  const completedBlocks = currentBlockIndex;

  const progressPercentage = (completedBlocks / blocks.length) * 100;

  await db.run(
    'UPDATE learning_sessions SET progress = ? WHERE id = ?',
    [progressPercentage, sessionId]
  );
}