import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Сократовский промпт
const SOCRATIC_PROMPT = `You are a Socratic tutor. 
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

/**
 * POST /api/chat
 * Отправить сообщение в чат и получить ответ от AI
 */
export async function POST(request: NextRequest) {
  try {
    // Проверяем наличие API ключа
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 503 }
      );
    }
    
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    // Получаем данные
    const body = await request.json();
    const { messages } = body;
    
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid request: messages array is required' },
        { status: 400 }
      );
    }
    
    // Добавляем системный промпт
    const messagesWithSystem = [
      { role: 'system', content: SOCRATIC_PROMPT },
      ...messages
    ];
    
    // Отправляем запрос к OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messagesWithSystem,
      temperature: 0.7,
      max_tokens: 1000,
    });
    
    const reply = completion.choices[0]?.message?.content || 'Извините, не удалось получить ответ.';
    
    return NextResponse.json({
      data: {
        reply,
        role: 'assistant',
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}