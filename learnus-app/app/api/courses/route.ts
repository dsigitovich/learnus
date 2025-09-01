import { NextRequest, NextResponse } from 'next/server';
import { openDb } from '@/lib/db';
import { CourseConfig } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const config: CourseConfig = await request.json();
    
    // Валидация
    if (!config.topic || !config.level || !config.length || !config.style) {
      return NextResponse.json(
        { error: 'Заполните все обязательные поля' },
        { status: 400 }
      );
    }

    const db = await openDb();
    const courseId = uuidv4();
    
    // Создаем курс
    await db.run(
      `INSERT INTO courses (id, topic, level, goal, length, style) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [courseId, config.topic, config.level, config.goal, config.length, config.style]
    );

    // Создаем пустой прогресс
    await db.run(
      `INSERT INTO user_course_progress (course_id, completed_blocks, total_insights, progress_percentage) 
       VALUES (?, '[]', 0, 0)`,
      [courseId]
    );

    await db.close();

    return NextResponse.json({
      data: {
        id: courseId,
        config,
        blocks: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json(
      { error: 'Ошибка создания курса' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const db = await openDb();
    
    const courses = await db.all(
      `SELECT * FROM courses ORDER BY created_at DESC`
    );

    await db.close();

    return NextResponse.json({ data: courses });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { error: 'Ошибка получения курсов' },
      { status: 500 }
    );
  }
}