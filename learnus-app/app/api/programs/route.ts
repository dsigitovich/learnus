import { NextRequest, NextResponse } from 'next/server';
import { programService } from '@/lib/services';
import { handleApiError } from '@/lib/utils/error-handler';
import { CreateProgramSchema } from '@/lib/services/program-service';

/**
 * GET /api/programs
 * Получить список всех программ
 */
export async function GET() {
  try {
    const programs = await programService.getAllPrograms();
    
    return NextResponse.json({
      data: programs,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/programs
 * Создать новую программу
 */
export async function POST(request: NextRequest) {
  try {
    // Получаем и валидируем данные
    const body = await request.json();
    const validatedData = CreateProgramSchema.parse(body);
    
    // Создаем программу
    const newProgram = await programService.createProgram(validatedData);
    
    return NextResponse.json({
      data: newProgram,
    }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
