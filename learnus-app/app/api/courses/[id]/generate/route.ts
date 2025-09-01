import { NextRequest, NextResponse } from 'next/server';
import { openDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { CourseBlock, SessionType } from '@/lib/types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Генерация структуры курса на основе конфигурации
async function generateCourseStructure(config: any): Promise<CourseBlock[]> {
  const blocks: CourseBlock[] = [];
  let order = 0;

  // Введение
  blocks.push({
    id: uuidv4(),
    type: 'introduction',
    title: 'Введение в ' + config.topic,
    content: `Добро пожаловать в курс по теме "${config.topic}". ${config.goal ? `Ваша цель: ${config.goal}.` : ''} Этот курс поможет вам систематически изучить материал через вопросы и практические задания.`,
    order: order++
  });

  // Определяем количество блоков в зависимости от длины курса
  const blockCounts = {
    short: { learning: 2, practice: 1 },
    medium: { learning: 4, practice: 2 },
    long: { learning: 6, practice: 3 }
  };

  const counts = blockCounts[config.length as keyof typeof blockCounts];

  // Генерируем блоки обучения
  for (let i = 0; i < counts.learning; i++) {
    const block: CourseBlock = {
      id: uuidv4(),
      type: 'learning',
      title: `Сессия ${i + 1}: Изучение ${config.topic}`,
      questions: [],
      difficulty: config.level === 'beginner' ? 'easy' : config.level === 'intermediate' ? 'medium' : 'hard',
      order: order++
    };

    // Генерируем вопросы для блока
    const questionCount = config.style === 'questions' ? 5 : 3;
    for (let j = 0; j < questionCount; j++) {
      block.questions!.push({
        id: uuidv4(),
        text: `Вопрос ${j + 1} по теме ${config.topic}`,
        hint: config.level === 'beginner' ? 'Подумайте о базовых концепциях' : undefined
      });
    }

    blocks.push(block);

    // После каждых 2 блоков обучения добавляем практику
    if ((i + 1) % 2 === 0 && counts.practice > 0) {
      blocks.push({
        id: uuidv4(),
        type: 'practice',
        title: `Практика ${Math.floor(i / 2) + 1}: Применение знаний`,
        content: `Примените полученные знания на практике. Создайте что-то связанное с ${config.topic} или решите практическую задачу.`,
        difficulty: block.difficulty,
        order: order++
      });
    }
  }

  // Рефлексия
  blocks.push({
    id: uuidv4(),
    type: 'reflection',
    title: 'Рефлексия и выводы',
    content: 'Время осмыслить изученный материал и сформулировать ключевые выводы.',
    order: order++
  });

  return blocks;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: courseId } = await params;
    const db = await openDb();
    
    // Получаем конфигурацию курса
    const course = await db.get(
      'SELECT * FROM courses WHERE id = ?',
      [courseId]
    );

    if (!course) {
      await db.close();
      return NextResponse.json(
        { error: 'Курс не найден' },
        { status: 404 }
      );
    }

    // Генерируем структуру курса
    const blocks = await generateCourseStructure(course);

    // Сохраняем блоки в БД
    for (const block of blocks) {
      await db.run(
        `INSERT INTO course_blocks (id, course_id, type, title, content, difficulty, order_index) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [block.id, courseId, block.type, block.title, block.content || null, block.difficulty || null, block.order]
      );

      // Сохраняем вопросы, если есть
      if (block.questions) {
        for (let i = 0; i < block.questions.length; i++) {
          const question = block.questions[i];
          await db.run(
            `INSERT INTO questions (id, block_id, text, hint, expected_answer, order_index) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [question.id, block.id, question.text, question.hint || null, question.expectedAnswer || null, i]
          );
        }
      }
    }

    await db.close();

    return NextResponse.json({
      data: {
        id: courseId,
        config: course,
        blocks,
        createdAt: course.created_at,
        updatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error generating course:', error);
    return NextResponse.json(
      { error: 'Ошибка генерации курса' },
      { status: 500 }
    );
  }
}