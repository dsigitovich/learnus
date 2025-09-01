import { NextRequest, NextResponse } from 'next/server';
import { chatService } from '@/lib/services';
import { handleApiError } from '@/lib/utils/error-handler';
import { SendMessageSchema } from '@/lib/services/chat-service';

/**
 * POST /api/chat
 * Отправить сообщение в чат и получить ответ от AI
 */
export async function POST(request: NextRequest) {
  try {
    // Проверяем доступность сервиса
    if (!chatService.isAvailable()) {
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 503 }
      );
    }
    
    // Получаем и валидируем данные
    const body = await request.json();
    const validatedData = SendMessageSchema.parse(body);
    
    // Отправляем сообщение и получаем ответ
    const reply = await chatService.sendMessage(validatedData);
    
    return NextResponse.json({
      data: {
        reply,
        role: 'assistant',
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * GET /api/chat
 * Получить историю чата
 */
export async function GET() {
  try {
    // Получаем историю чата
    const messages = await chatService.getChatHistory();
    
    return NextResponse.json({
      data: messages,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/chat
 * Очистить историю чата
 */
export async function DELETE() {
  try {
    // Очищаем историю чата
    await chatService.clearChatHistory();
    
    return NextResponse.json({
      message: 'Chat history cleared successfully',
    });
  } catch (error) {
    return handleApiError(error);
  }
}