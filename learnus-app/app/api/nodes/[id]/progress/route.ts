import { NextRequest, NextResponse } from 'next/server';
import { progressService } from '@/lib/services';
import { handleApiError } from '@/lib/utils/error-handler';
import { z } from 'zod';
import { NumericParamsSchema } from '@/lib/utils/validation';

// Схема для обновления прогресса без nodeId (он берется из параметров)
const UpdateProgressRequestSchema = z.object({
  status: z.enum(['not_started', 'in_progress', 'completed']),
  notes: z.string().optional(),
});

/**
 * GET /api/nodes/[id]/progress
 * Получить прогресс узла
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Валидируем параметры
    const resolvedParams = await params;
    const { id } = NumericParamsSchema.parse(resolvedParams);
    
    // Получаем прогресс узла
    const progress = await progressService.getNodeProgress(id);
    
    return NextResponse.json({
      data: progress,
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Валидируем параметры
    const resolvedParams = await params;
    const { id } = NumericParamsSchema.parse(resolvedParams);
    
    // Получаем и валидируем данные
    const body = await request.json();
    const validatedData = UpdateProgressRequestSchema.parse(body);
    
    // Обновляем прогресс
    const updatedProgress = await progressService.updateProgress({
      nodeId: id,
      ...validatedData,
    });
    
    return NextResponse.json({
      data: updatedProgress,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
