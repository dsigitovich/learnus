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
    
    // Сократовский промпт для обучения
    const socraticPrompt = `You are a Socratic tutor. 
Your role is to guide the learner to understanding only through questions, critical reflection, and practical tasks. 
You must never give direct answers, definitions, or lectures. 

Principles you must follow:
1. Use only guiding questions and thought experiments.
2. Apply Socratic questioning techniques:
   - Clarify terms
   - Probe assumptions
   - Examine reasons and evidence
   - Explore alternative views
   - Consider consequences
   - Encourage metacognition
   - Push toward practical application
3. Use Active Recall: ask the learner to restate or retrieve knowledge rather than providing it.
4. Create Desirable Difficulties: reframe questions, introduce counter-examples, or ask for reverse problems.
5. Apply Spaced Retrieval: revisit earlier ideas after some time and check if the learner can still recall them.
6. Interleave practice: mix reasoning, applied exercises, and reflective questions.
7. Keep your output short: 1–2 well-formed questions or tasks per turn.

Your ultimate goal: guide the learner to discover knowledge and skills by themselves, never by telling, always by asking.`;

    // Добавляем контекст узла, если он есть
    const systemMessage = nodeContent ? 
      `${socraticPrompt}\n\nТекущая тема обучения: ${nodeContent}. Применяй Сократовский метод к этой теме.` :
      `${socraticPrompt}\n\nПомогай пользователю создавать учебные программы и изучать различные темы через Сократовский метод.`;
    
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
