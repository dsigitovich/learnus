import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { Course, CourseProgress, AIReasoningStep } from '@/lib/types';
import { COURSE_CREATION_PROMPT, courseKeywords, SOCRATIC_PROMPT } from '@/lib/templates/system_promts';


// Функция для получения промпта для курса
function getCoursePrompt(course: Course, progress: CourseProgress): string {
  const currentModule = course.modules[progress.currentModuleIndex];
  const currentLesson = currentModule?.lessons[progress.currentLessonIndex];
  
  if (!currentModule || !currentLesson) {
    return SOCRATIC_PROMPT;
  }
  
  return `${SOCRATIC_PROMPT}

You are currently teaching a course: "${course.title}"
Course level: ${course.level}
Current module: "${currentModule.title}" (${progress.currentModuleIndex + 1} of ${course.modules.length})
Current lesson: "${currentLesson.title}" (${progress.currentLessonIndex + 1} of ${currentModule.lessons.length})

Lesson type: ${currentLesson.type}
Lesson content context: ${currentLesson.content}
Learning objectives for this module:
${currentModule.learning_objectives.map((obj, i) => `${i + 1}. ${obj}`).join('\n')}

Prompts to use with the learner:
${currentLesson.prompts_for_user.map((prompt, i) => `${i + 1}. ${prompt}`).join('\n')}

Expected outcome: ${currentLesson.expected_outcome}

${currentLesson.hints ? `Available hints (use sparingly, only if learner is stuck):
${currentLesson.hints.map((hint, i) => `${i + 1}. ${hint}`).join('\n')}` : ''}

Guide the learner through this lesson using the Socratic method. Focus on the current lesson objectives while maintaining the overall course progression.`;
}

// Функция для проверки, не является ли сообщение запросом на создание курса
function checkForCourseCreationRequest(message: string): boolean {

  const lowerMessage = message.toLowerCase();
  return courseKeywords.some(keyword => lowerMessage.includes(keyword));
}

/**
 * POST /api/chat
 * Отправить сообщение в чат и получить ответ от AI
 */
export async function POST(request: NextRequest) {
  try {
    // Проверяем наличие API ключа
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 503 }
      );
    }
    
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    // Получаем данные
    const body = await request.json();
    const { messages, context } = body;
    
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid request: messages array is required' },
        { status: 400 }
      );
    }
    
    // Проверяем последнее сообщение на запрос создания курса
    const lastMessage = messages[messages.length - 1];
    const isCreatingCourse = lastMessage && lastMessage.role === 'user' && checkForCourseCreationRequest(lastMessage.content);
    
    console.log('🔍 Debug info:', {
      lastMessage: lastMessage?.content,
      isCreatingCourse,
      hasOpenAIKey: !!process.env.OPENAI_API_KEY
    });
    
    let systemPrompt = SOCRATIC_PROMPT;
    
    // Если это обучение по курсу, используем специальный промпт
    if (context && context.type === 'course' && context.course && context.progress) {
      systemPrompt = getCoursePrompt(context.course, context.progress);
    }
    
    // Если это запрос на создание курса, используем специальный промпт
    if (isCreatingCourse) {
      systemPrompt = COURSE_CREATION_PROMPT;
      console.log('📚 Using course creation prompt');
    }
    
    // Добавляем системный промпт
    const messagesWithSystem = [
      { role: 'system', content: systemPrompt },
      ...messages
    ];
    
    // Отправляем запрос к OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messagesWithSystem,
      temperature: 0.7,
      max_tokens: 2000,
    });
    
    const reply = completion.choices[0]?.message?.content || 'Извините, не удалось получить ответ.';
    
    console.log('🤖 Raw AI response length:', reply.length);
    console.log('🔍 Contains COURSE_JSON:', reply.includes('<COURSE_JSON>'));
    console.log('🔍 Contains REASONING_STEPS:', reply.includes('<REASONING_STEPS>'));
    
    // Проверяем, содержит ли ответ JSON курса
    const courseJsonMatch = reply.match(/<COURSE_JSON>([\s\S]*?)<\/COURSE_JSON>/);
    let courseData = null;
    
    if (courseJsonMatch && courseJsonMatch[1]) {
      try {
        const courseJson = courseJsonMatch[1].trim();
        const parsedData = JSON.parse(courseJson);
        courseData = parsedData.course;
      } catch (error) {
        console.error('Failed to parse course JSON:', error);
      }
    }
    
    // Проверяем, содержит ли ответ шаги рассуждений
    const reasoningMatch = reply.match(/<REASONING_STEPS>([\s\S]*?)<\/REASONING_STEPS>/);
    let reasoningSteps: AIReasoningStep[] = [];
    
    if (reasoningMatch && reasoningMatch[1]) {
      try {
        const reasoningJson = reasoningMatch[1].trim();
        console.log('🔍 Raw reasoning JSON:', reasoningJson);
        const parsedReasoning = JSON.parse(reasoningJson);
        reasoningSteps = Array.isArray(parsedReasoning) ? parsedReasoning : [];
        console.log('✅ Reasoning steps parsed successfully:', reasoningSteps.length);
      } catch (error) {
        console.error('❌ Failed to parse reasoning steps JSON:', error);
        console.log('🔍 Raw reasoning content that failed to parse:', reasoningMatch[1]);
      }
    } else {
      console.log('❌ No REASONING_STEPS found in response');
      console.log('🔍 Response preview (first 200 chars):', reply.substring(0, 200));
      
      // Fallback: создаем базовые reasoning steps только для создания курса
      const isCourseCreation = reply.includes('<COURSE_JSON>');
      if (isCourseCreation) {
        reasoningSteps = [
          {
            id: 'fallback1',
            description: 'Проанализировал запрос пользователя',
            emoji: '🔍'
          },
          {
            id: 'fallback2', 
            description: 'Сформулировал ответ на основе контекста',
            emoji: '💭'
          },
          {
            id: 'fallback3',
            description: 'Добавил следующий вопрос для продолжения обучения',
            emoji: '➡️'
          }
        ];
        console.log('⚠️ Using fallback reasoning steps for course creation:', reasoningSteps.length);
      } else {
        console.log('ℹ️ No fallback reasoning steps needed for regular message');
      }
    }
    
    // Очищаем ответ от служебных тегов
    const cleanReply = reply
      .replace(/<COURSE_JSON>[\s\S]*?<\/COURSE_JSON>/, '')
      .replace(/<REASONING_STEPS>[\s\S]*?<\/REASONING_STEPS>/, '')
      .trim();
    
    console.log('📤 Final response data:', {
      replyLength: cleanReply.length,
      hasCourse: !!courseData,
      hasReasoning: reasoningSteps.length > 0,
      reasoningCount: reasoningSteps.length
    });
    
    return NextResponse.json({
      data: {
        reply: cleanReply,
        role: 'assistant',
        course: courseData,
        reasoning: reasoningSteps.length > 0 ? reasoningSteps : undefined,
      },
    });
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