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
 * GET /api/chat?nodeId=123
 * Получить историю чата для узла
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const nodeId = searchParams.get('nodeId');
    
    if (!nodeId) {
      return NextResponse.json(
        { error: 'nodeId parameter is required' },
        { status: 400 }
      );
    }
    
    // Получаем историю чата
    const history = await chatService.getChatHistory(Number(nodeId));
    
    return NextResponse.json({ data: history });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/chat?nodeId=123
 * Очистить историю чата для узла
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const nodeId = searchParams.get('nodeId');
    
    if (!nodeId) {
      return NextResponse.json(
        { error: 'nodeId parameter is required' },
        { status: 400 }
      );
    }
    
    // Очищаем историю чата
    await chatService.clearChatHistory(Number(nodeId));
    
    return NextResponse.json({
      message: 'Chat history cleared successfully',
    });
  } catch (error) {
    return handleApiError(error);
  }
}