import { NextRequest, NextResponse } from 'next/server';
import { progressService } from '@/lib/services';
import { handleApiError } from '@/lib/utils/error-handler';
import { UpdateProgressSchema } from '@/lib/services/progress-service';
import { z } from 'zod';

// Схема для параметров
const ParamsSchema = z.object({
  id: z.string().transform(Number),
});

/**
 * GET /api/nodes/[id]/progress
 * Получить прогресс узла
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Валидируем параметры
    const { id } = ParamsSchema.parse(params);
    
    // Получаем прогресс
    const progress = await progressService.getNodeProgress(id);
    
    return NextResponse.json({
      data: progress || {
        node_id: id,
        status: 'not_started',
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PUT /api/nodes/[id]/progress
 * Обновить прогресс узла
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Валидируем параметры
    const { id: nodeId } = ParamsSchema.parse(params);
    
    // Получаем и валидируем данные
    const body = await request.json();
    const validatedData = UpdateProgressSchema.parse({
      ...body,
      nodeId,
    });
    
    // Обновляем прогресс
    const progress = await progressService.updateProgress(validatedData);
    
    return NextResponse.json({ data: progress });
  } catch (error) {
    return handleApiError(error);
  }
}