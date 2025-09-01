import { NextRequest, NextResponse } from 'next/server';
import { openDb } from '@/lib/db';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: sessionId } = await params;
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

    // Получаем все блоки курса
    const blocks = await db.all(
      'SELECT id FROM course_blocks WHERE course_id = ? ORDER BY order_index',
      [session.course_id]
    );

    // Находим индекс текущего блока
    const currentIndex = blocks.findIndex((b: any) => b.id === session.current_block_id);
    
    // Обновляем прогресс пользователя - добавляем текущий блок в завершенные
    const progress = await db.get(
      'SELECT * FROM user_course_progress WHERE course_id = ?',
      [session.course_id]
    );

    let completedBlocks = JSON.parse(progress.completed_blocks || '[]');
    if (!completedBlocks.includes(session.current_block_id)) {
      completedBlocks.push(session.current_block_id);
      
      await db.run(
        'UPDATE user_course_progress SET completed_blocks = ?, last_active_at = CURRENT_TIMESTAMP WHERE course_id = ?',
        [JSON.stringify(completedBlocks), session.course_id]
      );
    }

    // Проверяем, есть ли следующий блок
    if (currentIndex + 1 < blocks.length) {
      const nextBlock = blocks[currentIndex + 1];
      
      // Обновляем сессию
      await db.run(
        'UPDATE learning_sessions SET current_block_id = ?, current_question_index = 0 WHERE id = ?',
        [nextBlock.id, sessionId]
      );

      // Обновляем прогресс
      const progressPercentage = ((currentIndex + 1) / blocks.length) * 100;
      await db.run(
        'UPDATE learning_sessions SET progress = ? WHERE id = ?',
        [progressPercentage, sessionId]
      );

      await db.run(
        'UPDATE user_course_progress SET progress_percentage = ? WHERE course_id = ?',
        [progressPercentage, session.course_id]
      );

      await db.close();

      return NextResponse.json({
        data: {
          completed: false,
          nextBlockId: nextBlock.id
        }
      });
    } else {
      // Курс завершен
      await db.run(
        'UPDATE learning_sessions SET completed_at = CURRENT_TIMESTAMP, progress = 100 WHERE id = ?',
        [sessionId]
      );

      await db.run(
        'UPDATE user_course_progress SET progress_percentage = 100 WHERE course_id = ?',
        [session.course_id]
      );

      await db.close();

      return NextResponse.json({
        data: {
          completed: true,
          courseId: session.course_id
        }
      });
    }
  } catch (error) {
    console.error('Error moving to next block:', error);
    return NextResponse.json(
      { error: 'Ошибка перехода к следующему блоку' },
      { status: 500 }
    );
  }
}