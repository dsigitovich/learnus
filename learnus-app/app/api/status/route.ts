import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function GET(request: NextRequest) {
  try {
    // Проверяем наличие API ключа
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        success: false,
        apiKeyConfigured: false,
        error: 'OpenAI API key is not configured'
      }, { status: 500 });
    }
    
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    // Проверяем доступные модели
    const models = await openai.models.list();
    
    // Пробуем сделать простой запрос для проверки квоты
    let quotaStatus = 'unknown';
    try {
      const testCompletion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: "test" }],
        max_tokens: 5,
      });
      quotaStatus = 'available';
    } catch (quotaError: any) {
      if (quotaError.status === 429) {
        quotaStatus = 'quota_exceeded';
      } else {
        quotaStatus = 'error';
      }
    }
    
    return NextResponse.json({
      success: true,
      apiKeyConfigured: true,
      modelsAvailable: models.data.length,
      quotaStatus: quotaStatus,
      message: quotaStatus === 'quota_exceeded' 
        ? 'API ключ работает, но превышен лимит квоты. Проверьте план и биллинг на OpenAI Platform.'
        : quotaStatus === 'available'
        ? 'API ключ работает корректно'
        : 'Ошибка при проверке API ключа',
      availableModels: models.data.slice(0, 10).map(model => model.id)
    });
    
  } catch (error) {
    console.error('Status API error:', error);
    return NextResponse.json({
      success: false,
      apiKeyConfigured: false,
      error: 'Ошибка при проверке API ключа',
      details: error instanceof Error ? error.message : 'Неизвестная ошибка'
    }, { status: 500 });
  }
}
