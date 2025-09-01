import { NextRequest, NextResponse } from 'next/server';
import { nodeService, programService } from '@/lib/services';
import { handleApiError } from '@/lib/utils/error-handler';
import { CreateNodeSchema } from '@/lib/services/node-service';
import { ParamsSchema } from '@/lib/utils/validation';

/**
 * GET /api/programs/[id]/nodes
 * Получить все узлы программы
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Валидируем параметры
    const { id } = ParamsSchema.parse(params);
    
    // Получаем узлы программы
    const nodes = await nodeService.getProgramNodes(id);
    
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
  { params }: { params: { id: string } }
) {
  try {
    // Валидируем параметры
    const { id: programId } = ParamsSchema.parse(params);
    
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
