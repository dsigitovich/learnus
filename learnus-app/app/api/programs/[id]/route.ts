import { NextRequest, NextResponse } from 'next/server';
import { programService } from '@/lib/services';
import { handleApiError } from '@/lib/utils/error-handler';
import { UpdateProgramSchema } from '@/lib/services/program-service';
import { NumericParamsSchema } from '@/lib/utils/validation';

/**
 * GET /api/programs/[id]
 * Получить программу по ID
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Валидируем параметры
    const resolvedParams = await params;
    const { id } = NumericParamsSchema.parse(resolvedParams);
    
    // Получаем программу
    const program = await programService.getProgramById(id);
    
    if (!program) {
      return NextResponse.json(
        { error: 'Program not found' },
        { status: 404 }
      );
    }
    
    // Получаем узлы программы
    const nodes = await programService.getProgramNodes(id);
    
    return NextResponse.json({
      data: {
        ...program,
        nodes,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PATCH /api/programs/[id]
 * Обновить программу
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Валидируем параметры
    const resolvedParams = await params;
    const { id } = NumericParamsSchema.parse(resolvedParams);
    
    // Получаем и валидируем данные
    const body = await request.json();
    const validatedData = UpdateProgramSchema.parse(body);
    
    // Обновляем программу
    const program = await programService.updateProgram(id, validatedData);
    
    return NextResponse.json({ data: program });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/programs/[id]
 * Удалить программу
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Валидируем параметры
    const resolvedParams = await params;
    const { id } = NumericParamsSchema.parse(resolvedParams);
    
    // Удаляем программу
    await programService.deleteProgram(id);
    
    return NextResponse.json(
      { message: 'Program deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
