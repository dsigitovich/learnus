import { NextRequest, NextResponse } from 'next/server';
import { progressService } from '@/lib/services';
import { handleApiError } from '@/lib/utils/error-handler';
import { z } from 'zod';

// Схема для параметров
const ParamsSchema = z.object({
  id: z.string().transform(Number),
});

/**
 * GET /api/programs/[id]/stats
 * Получить статистику прогресса программы
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Валидируем параметры
    const { id } = ParamsSchema.parse(params);
    
    // Получаем статистику
    const stats = await progressService.getProgramStats(id);
    
    // Получаем следующий узел для изучения
    const nextNode = await progressService.getNextNode(id);
    
    return NextResponse.json({
      data: {
        ...stats,
        nextNode,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
