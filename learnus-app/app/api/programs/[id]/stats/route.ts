import { NextRequest, NextResponse } from 'next/server';
import { progressService } from '@/lib/services';
import { handleApiError } from '@/lib/utils/error-handler';
import { NumericParamsSchema } from '@/lib/utils/validation';

/**
 * GET /api/programs/[id]/stats
 * Получить статистику прогресса программы
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Валидируем параметры
    const resolvedParams = await params;
    const { id } = NumericParamsSchema.parse(resolvedParams);
    
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
