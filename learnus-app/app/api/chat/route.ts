import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { openDb } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { messages, nodeId, nodeContent } = await request.json();
    
    // Проверяем наличие API ключа
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 500 }
      );
    }
    
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    // Добавляем контекст узла, если он есть
    const systemMessage = nodeContent ? 
      `Ты помощник для обучения. Текущая тема: ${nodeContent}. Помогай пользователю изучать эту тему, отвечай на вопросы и давай объяснения.` :
      'Ты помощник для обучения. Помогай пользователю создавать учебные программы и изучать различные темы.';
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemMessage },
        ...messages
      ],
    });
    
    const reply = completion.choices[0].message.content;
    
    // Сохраняем в историю чата, если есть nodeId
    if (nodeId) {
      try {
        const db = await openDb();
        await db.run(
          'INSERT INTO chat_history (node_id, role, content) VALUES (?, ?, ?)',
          [nodeId, 'user', messages[messages.length - 1].content]
        );
        await db.run(
          'INSERT INTO chat_history (node_id, role, content) VALUES (?, ?, ?)',
          [nodeId, 'assistant', reply]
        );
        await db.close();
      } catch (dbError) {
        console.error('Database error:', dbError);
        // Продолжаем выполнение даже если сохранение в БД не удалось
      }
    }
    
    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    );
  }
}
