import { NextRequest, NextResponse } from 'next/server';
import { nodeService } from '@/lib/services';
import { handleApiError } from '@/lib/utils/error-handler';
import { UpdateNodeSchema } from '@/lib/services/node-service';

/**
 * GET /api/nodes/[id]
 * Получить узел по ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const node = await nodeService.getNodeById(params.id);
    
    if (!node) {
      return NextResponse.json(
        { error: 'Node not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ data: node });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PATCH /api/nodes/[id]
 * Обновить узел
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Получаем и валидируем данные
    const body = await request.json();
    const validatedData = UpdateNodeSchema.parse(body);
    
    // Обновляем узел
    const node = await nodeService.updateNode(params.id, validatedData);
    
    return NextResponse.json({ data: node });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/nodes/[id]
 * Удалить узел
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await nodeService.deleteNode(params.id);
    
    return NextResponse.json(
      { message: 'Node deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}