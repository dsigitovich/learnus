import { NextRequest, NextResponse } from 'next/server';
import { chatService, programService, nodeService } from '@/lib/services';
import { handleApiError } from '@/lib/utils/error-handler';
import { z } from 'zod';

// Схема для генерации программы
const GenerateProgramSchema = z.object({
  topic: z.string().min(1).max(200),
  autoCreate: z.boolean().optional().default(false),
});

/**
 * POST /api/programs/generate
 * Генерировать программу обучения с помощью AI
 */
export async function POST(request: NextRequest) {
  try {
    // Проверяем доступность сервиса
    if (!chatService.isAvailable()) {
      return NextResponse.json(
        { error: 'OpenAI API is not configured' },
        { status: 503 }
      );
    }
    
    // Получаем и валидируем данные
    const body = await request.json();
    const { topic, autoCreate } = GenerateProgramSchema.parse(body);
    
    // Генерируем программу
    const generatedProgram = await chatService.generateProgram(topic);
    
    // Если autoCreate = true, создаем программу в БД
    if (autoCreate) {
      // Создаем программу
      const program = await programService.createProgram({
        title: generatedProgram.title,
        description: generatedProgram.description,
      });
      
      // Создаем узлы
      const nodes = [];
      for (let i = 0; i < generatedProgram.nodes.length; i++) {
        const nodeData = generatedProgram.nodes[i];
        if (nodeData) {
          const node = await nodeService.createNode({
            programId: program.id,
            title: nodeData.title,
            description: nodeData.description,
            position: {
              x: 100 + (i % 3) * 250,
              y: 100 + Math.floor(i / 3) * 200,
            },
          });
          nodes.push(node);
        }
      }
      
      return NextResponse.json({
        data: {
          program,
          nodes,
          generated: generatedProgram,
        },
      }, { status: 201 });
    }
    
    // Возвращаем только сгенерированные данные
    return NextResponse.json({
      data: generatedProgram,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
