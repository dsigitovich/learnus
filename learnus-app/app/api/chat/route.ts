import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { Course, CourseProgress } from '@/lib/types';
import * as fs from 'fs';
import * as path from 'path';
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
    
    let systemPrompt = SOCRATIC_PROMPT;
    
    // Если это обучение по курсу, используем специальный промпт
    if (context && context.type === 'course' && context.course && context.progress) {
      systemPrompt = getCoursePrompt(context.course, context.progress);
    }
    
    // Если это запрос на создание курса, используем специальный промпт
    if (isCreatingCourse) {

      systemPrompt = COURSE_CREATION_PROMPT;
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
    
    // Проверяем, содержит ли ответ JSON курса
    const courseJsonMatch = reply.match(/<COURSE_JSON>([\s\S]*?)<\/COURSE_JSON>/);
    let courseData = null;
    
    if (courseJsonMatch) {
      try {
        const courseJson = courseJsonMatch[1].trim();
        const parsedData = JSON.parse(courseJson);
        courseData = parsedData.course;
      } catch (error) {
        console.error('Failed to parse course JSON:', error);
      }
    }
    
    return NextResponse.json({
      data: {
        reply: reply.replace(/<COURSE_JSON>[\s\S]*?<\/COURSE_JSON>/, '').trim(),
        role: 'assistant',
        course: courseData,
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