import { NextRequest, NextResponse } from 'next/server';
import { openDb } from '@/lib/db';
import { CourseBlock } from '@/lib/types';

interface RouteParams {
  params: Promise<{ id: string; blockId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { blockId } = await params;
    const db = await openDb();
    
    const block = await db.get(
      'SELECT * FROM course_blocks WHERE id = ?',
      [blockId]
    );

    if (!block) {
      await db.close();
      return NextResponse.json(
        { error: 'Блок не найден' },
        { status: 404 }
      );
    }

    // Получаем вопросы
    const questions = await db.all(
      'SELECT * FROM questions WHERE block_id = ? ORDER BY order_index',
      [blockId]
    );

    await db.close();

    const blockData: CourseBlock = {
      id: block.id,
      type: block.type,
      title: block.title,
      content: block.content,
      questions: questions.map(q => ({
        id: q.id,
        text: q.text,
        hint: q.hint,
        expectedAnswer: q.expected_answer
      })),
      difficulty: block.difficulty,
      order: block.order_index
    };

    return NextResponse.json({ data: blockData });
  } catch (error) {
    console.error('Error fetching block:', error);
    return NextResponse.json(
      { error: 'Ошибка получения блока' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { blockId } = await params;
    const updates = await request.json();
    const db = await openDb();
    
    // Обновляем блок
    const allowedFields = ['title', 'content', 'difficulty'];
    const updateFields = Object.keys(updates)
      .filter(key => allowedFields.includes(key))
      .map(key => `${key} = ?`);
    
    if (updateFields.length === 0) {
      await db.close();
      return NextResponse.json(
        { error: 'Нет полей для обновления' },
        { status: 400 }
      );
    }

    const values = Object.keys(updates)
      .filter(key => allowedFields.includes(key))
      .map(key => updates[key]);
    values.push(blockId);

    await db.run(
      `UPDATE course_blocks SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );

    await db.close();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating block:', error);
    return NextResponse.json(
      { error: 'Ошибка обновления блока' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: courseId, blockId } = await params;
    const db = await openDb();
    
    // Удаляем блок
    await db.run('DELETE FROM course_blocks WHERE id = ?', [blockId]);
    
    // Переупорядочиваем оставшиеся блоки
    const blocks = await db.all(
      'SELECT id FROM course_blocks WHERE course_id = ? ORDER BY order_index',
      [courseId]
    );
    
    for (let i = 0; i < blocks.length; i++) {
      await db.run(
        'UPDATE course_blocks SET order_index = ? WHERE id = ?',
        [i, blocks[i].id]
      );
    }

    await db.close();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting block:', error);
    return NextResponse.json(
      { error: 'Ошибка удаления блока' },
      { status: 500 }
    );
  }
}