import { NextRequest, NextResponse } from 'next/server';
import { nodeService, programService } from '@/lib/services';
import { handleApiError } from '@/lib/utils/error-handler';
import { CreateNodeSchema } from '@/lib/services/node-service';
import { NumericParamsSchema } from '@/lib/utils/validation';

/**
 * GET /api/programs/[id]/nodes
 * Получить все узлы программы
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Валидируем параметры
    const resolvedParams = await params;
    const { id } = NumericParamsSchema.parse(resolvedParams);
    
    // Получаем узлы программы
    const nodes = await programService.getProgramNodes(id);
    
    return NextResponse.json({
      data: nodes,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/programs/[id]/nodes
 * Создать новый узел в программе
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Валидируем параметры
    const resolvedParams = await params;
    const { id: programId } = NumericParamsSchema.parse(resolvedParams);
    
    // Получаем и валидируем данные
    const body = await request.json();
    const validatedData = CreateNodeSchema.parse(body);
    
    // Создаем узел
    const newNode = await nodeService.createNode({
      ...validatedData,
      programId,
    });
    
    return NextResponse.json({
      data: newNode,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
