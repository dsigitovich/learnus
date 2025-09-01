import { NextRequest, NextResponse } from 'next/server';
import { openDb } from '@/lib/db';
import { Course, CourseBlock, Question } from '@/lib/types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: courseId } = await params;
    const db = await openDb();
    
    // Получаем курс
    const courseData = await db.get(
      'SELECT * FROM courses WHERE id = ?',
      [courseId]
    );

    if (!courseData) {
      await db.close();
      return NextResponse.json(
        { error: 'Курс не найден' },
        { status: 404 }
      );
    }

    // Получаем блоки курса
    const blocks = await db.all(
      'SELECT * FROM course_blocks WHERE course_id = ? ORDER BY order_index',
      [courseId]
    );

    // Получаем вопросы для каждого блока
    const blocksWithQuestions: CourseBlock[] = await Promise.all(
      blocks.map(async (block) => {
        const questions = await db.all(
          'SELECT * FROM questions WHERE block_id = ? ORDER BY order_index',
          [block.id]
        );

        return {
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
      })
    );

    await db.close();

    const course: Course = {
      id: courseData.id,
      config: {
        topic: courseData.topic,
        level: courseData.level,
        goal: courseData.goal,
        length: courseData.length,
        style: courseData.style
      },
      blocks: blocksWithQuestions,
      createdAt: courseData.created_at,
      updatedAt: courseData.updated_at
    };

    return NextResponse.json({ data: course });
  } catch (error) {
    console.error('Error fetching course:', error);
    return NextResponse.json(
      { error: 'Ошибка получения курса' },
      { status: 500 }
    );
  }
}