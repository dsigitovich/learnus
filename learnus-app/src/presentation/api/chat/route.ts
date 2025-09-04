import { NextRequest, NextResponse } from 'next/server';
import 'reflect-metadata';
import { container } from '@shared/container/container';
import { TYPES } from '@shared/container/types';
import { IAIService } from '@application/interfaces/IAIService';
import { CreateCourseUseCase } from '@application/use-cases/CreateCourseUseCase';
import { CreateCourseDto } from '@application/dto/CreateCourseDto';
import { ChatMessage } from '@/lib/types';
import { courseKeywords } from '@/lib/templates/system_promts';

// Helper function to check if message is a course creation request
function checkForCourseCreationRequest(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  return courseKeywords.some(keyword => lowerMessage.includes(keyword));
}

// Helper function to extract course request from message
function extractCourseRequest(message: string): CreateCourseDto {
  // Simple extraction - в реальном приложении нужна более сложная логика
  return {
    title: 'Новый курс', // Будет заменено AI
    description: 'Описание курса', // Будет заменено AI
    level: 'Beginner', // По умолчанию
    prompt: message,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, context } = body;
    
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid request: messages array is required' },
        { status: 400 }
      );
    }
    
    // Check if this is a course creation request
    const lastMessage = messages[messages.length - 1] as ChatMessage;
    const isCreatingCourse = lastMessage && lastMessage.role === 'user' && 
                           checkForCourseCreationRequest(lastMessage.content);
    
    if (isCreatingCourse) {
      // Handle course creation
      const createCourseUseCase = container.get<CreateCourseUseCase>(TYPES.CreateCourseUseCase);
      const courseRequest = extractCourseRequest(lastMessage.content);
      
      const result = await createCourseUseCase.execute(courseRequest);
      
      if (result.isFailure) {
        return NextResponse.json(
          { error: result.getError().message },
          { status: 400 }
        );
      }
      
      const courseResponse = result.getValue();
      
      return NextResponse.json({
        data: {
          reply: `Отлично! Я создал для вас курс "${courseResponse.title}". 

Описание: ${courseResponse.description}
Уровень: ${courseResponse.level}
Количество модулей: ${courseResponse.totalModules}
Всего уроков: ${courseResponse.totalLessons}

Курс готов к изучению! Вы можете начать обучение прямо сейчас.`,
          role: 'assistant',
          courseId: courseResponse.courseId,
        },
      });
    } else {
      // Handle regular chat
      const aiService = container.get<IAIService>(TYPES.IAIService);
      
      let chatContext = undefined;
      if (context && context.type === 'course' && context.course) {
        chatContext = {
          courseTitle: context.course.title,
          currentLesson: context.currentLesson?.title,
          learningObjectives: context.module?.learningObjectives,
        };
      }
      
      const reply = await aiService.generateSocraticResponse(
        lastMessage.content,
        chatContext
      );
      
      return NextResponse.json({
        data: {
          reply,
          role: 'assistant',
        },
      });
    }
  } catch (error) {
    console.error('Chat API error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}