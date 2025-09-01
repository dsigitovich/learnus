import { NextRequest, NextResponse } from 'next/server';
import { openDb } from '@/lib/db';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const systemPrompt = `Ты - эксперт в создании структурированных учебных программ.
На основе запроса пользователя создай детальную учебную программу в виде дерева знаний.

Структура программы должна включать:
1. Основные разделы (корневые узлы)
2. Подразделы и темы (дочерние узлы)
3. Логические связи между темами
4. Предполагаемую последовательность изучения

Ответ должен быть в формате JSON:
{
  "title": "Название программы",
  "description": "Описание программы",
  "nodes": [
    {
      "id": "уникальный_id",
      "title": "Название темы",
      "description": "Описание темы",
      "content": "Краткое содержание для изучения",
      "parent_id": null или "id_родителя",
      "prerequisites": ["id_предварительных_тем"],
      "estimatedTime": "Примерное время изучения",
      "position": { "x": число, "y": число }
    }
  ]
}

Создай минимум 10-15 узлов с логической структурой.
Расположи узлы так, чтобы они формировали читаемое дерево слева направо.`;

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();
    
    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Генерация программы с помощью AI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const responseContent = completion.choices[0].message.content;
    if (!responseContent) {
      throw new Error('No content from AI');
    }

    // Парсинг JSON ответа
    const programData = JSON.parse(responseContent);
    
    // Сохранение программы в БД
    const db = await openDb();
    
    // Создание программы
    const result = await db.run(
      'INSERT INTO learning_programs (title, description) VALUES (?, ?)',
      [programData.title, programData.description]
    );
    
    const programId = result.lastID;
    
    // Создание узлов
    const nodeMapping = new Map<string, number>();
    
    // Сортировка узлов так, чтобы родители создавались раньше детей
    const sortedNodes = programData.nodes.sort((a: any, b: any) => {
      if (!a.parent_id) return -1;
      if (!b.parent_id) return 1;
      return 0;
    });
    
    for (const node of sortedNodes) {
      const parentId = node.parent_id ? nodeMapping.get(node.parent_id) : null;
      
      const nodeResult = await db.run(
        `INSERT INTO program_nodes 
         (program_id, parent_id, title, description, content, position_x, position_y, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          programId,
          parentId,
          node.title,
          node.description,
          node.content,
          node.position.x,
          node.position.y,
          'not_started'
        ]
      );
      
      nodeMapping.set(node.id, nodeResult.lastID!);
    }
    
    // Получение созданной программы с узлами
    const program = await db.get(
      'SELECT * FROM learning_programs WHERE id = ?',
      [programId]
    );
    
    const nodes = await db.all(
      'SELECT * FROM program_nodes WHERE program_id = ?',
      [programId]
    );
    
    await db.close();
    
    return NextResponse.json({
      program,
      nodes,
      message: 'Программа успешно создана!'
    });
    
  } catch (error) {
    console.error('Error generating program:', error);
    return NextResponse.json(
      { error: 'Failed to generate program' },
      { status: 500 }
    );
  }
}