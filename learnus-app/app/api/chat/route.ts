import { NextRequest } from 'next/server';
import OpenAI from 'openai';
import { Course, CourseProgress } from '@/lib/types';
import * as fs from 'fs';
import * as path from 'path';

// Читаем Сократовский промпт из файла
let SOCRATIC_PROMPT = '';
try {
  const promptPath = path.join(process.cwd(), 'lib', 'templates', 'socratic_prompt.txt');
  SOCRATIC_PROMPT = fs.readFileSync(promptPath, 'utf-8');
} catch (error) {
  console.error('Failed to read Socratic prompt:', error);
  SOCRATIC_PROMPT = `You are a Socratic tutor. Your role is to guide the learner to understanding only through questions. IMPORTANT: Always respond in Russian.`;
}

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

Guide the learner through this lesson using the Socratic method. Focus on the current lesson objectives while maintaining the overall course progression.

IMPORTANT: Always respond in Russian.`;
}

// Функция для проверки, не является ли сообщение запросом на создание курса
function checkForCourseCreationRequest(message: string): boolean {
  const courseKeywords = [
    'создать курс',
    'создай курс',
    'сделать курс',
    'сделай курс',
    'новый курс',
    'разработать курс',
    'разработай курс',
    'обучающий курс',
    'учебный курс',
    'курс по',
    'курс для',
    'хочу курс',
    'нужен курс',
    'составь курс',
    'составить курс',
    'сгенерируй курс',
    'сгенерировать курс'
  ];
  
  const lowerMessage = message.toLowerCase();
  return courseKeywords.some(keyword => lowerMessage.includes(keyword));
}

// Промпт для размышлений при создании курса
const COURSE_CREATION_THOUGHTS_PROMPT = `You are an expert educational course designer. When creating a course, you should think out loud about the process.

IMPORTANT: Always respond in Russian.

First, share your thoughts about:
1. What topic the user wants to learn
2. What level might be appropriate
3. What key modules would be valuable
4. How to balance theory and practice

Format your thoughts as:
<THOUGHT>
[Your thinking process in Russian]
</THOUGHT>

After sharing 2-3 thoughts about the course structure, then generate the complete course.`;

/**
 * POST /api/chat
 * Отправить сообщение в чат и получить ответ от AI через стриминг
 */
export async function POST(request: NextRequest) {
  // Создаём поток для Server-Sent Events
  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  
  // Функция для отправки событий
  const sendEvent = async (event: string, data: any) => {
    const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    await writer.write(encoder.encode(message));
  };
  
  // Запускаем асинхронную обработку
  (async () => {
    try {
      // Проверяем наличие API ключа
      if (!process.env.OPENAI_API_KEY) {
        await sendEvent('error', { 
          error: 'OpenAI API key is not configured',
          statusCode: 503 
        });
        await writer.close();
        return;
      }
      
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
      
      // Получаем данные
      const body = await request.json();
      const { messages, context } = body;
      
      if (!messages || !Array.isArray(messages)) {
        await sendEvent('error', { 
          error: 'Invalid request: messages array is required',
          statusCode: 400 
        });
        await writer.close();
        return;
      }
      
      // Проверяем последнее сообщение на запрос создания курса
      const lastMessage = messages[messages.length - 1];
      const isCreatingCourse = lastMessage && lastMessage.role === 'user' && checkForCourseCreationRequest(lastMessage.content);
      
      let systemPrompt = SOCRATIC_PROMPT;
      let useStreaming = true;
      
      // Если это обучение по курсу, используем специальный промпт
      if (context && context.type === 'course' && context.course && context.progress) {
        systemPrompt = getCoursePrompt(context.course, context.progress);
      }
      
      // Если это запрос на создание курса, используем специальный промпт с размышлениями
      if (isCreatingCourse) {
        // Читаем шаблон курса
        const templatePath = path.join(process.cwd(), 'lib', 'templates', 'course_template.json');
        const courseTemplate = fs.readFileSync(templatePath, 'utf-8');
        
        // Сначала отправляем размышления
        await sendEvent('thought', { 
          content: '🤔 Анализирую ваш запрос на создание курса...' 
        });
        
        systemPrompt = `${COURSE_CREATION_THOUGHTS_PROMPT}

When the user requests to create a course:
1. First share 2-3 thoughts about the course design
2. Then create a complete course structure

Extract from their request:
- The topic they want to learn
- Implied skill level (if not specified, assume Beginner)
- Any specific areas they mentioned

Then create a course following this template:

${courseTemplate}

Fill in the template with:
- Relevant, practical content based on the topic
- Clear learning objectives
- Mix of theory and practice lessons (focus on practice)
- Progressive difficulty
- Practical exercises and reflection questions

After your thoughts, generate the course and present it in this format:

Я создал для вас курс "[название курса]". Вот его структура:

[Brief description of what the course covers]

Then output the complete course structure wrapped in:
<COURSE_JSON>
{your generated course JSON here}
</COURSE_JSON>`;
      }
      
      // Добавляем системный промпт
      const messagesWithSystem = [
        { role: 'system', content: systemPrompt },
        ...messages
      ];
      
      // Создаём стриминговый запрос к OpenAI
      const stream = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: messagesWithSystem as any,
        temperature: 0.7,
        max_tokens: 2000,
        stream: true,
      });
      
      let fullResponse = '';
      let currentThought = '';
      let inThought = false;
      
      // Обрабатываем стрим
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        fullResponse += content;
        
        // Если создаём курс, обрабатываем размышления
        if (isCreatingCourse) {
          // Проверяем начало размышления
          if (content.includes('<THOUGHT>')) {
            inThought = true;
            currentThought = content.split('<THOUGHT>')[1] || '';
          } else if (inThought && content.includes('</THOUGHT>')) {
            // Завершаем размышление
            currentThought += content.split('</THOUGHT>')[0];
            await sendEvent('thought', { content: currentThought.trim() });
            inThought = false;
            currentThought = '';
            // Отправляем остаток контента как обычный текст
            const remaining = content.split('</THOUGHT>')[1];
            if (remaining) {
              await sendEvent('content', { content: remaining });
            }
          } else if (inThought) {
            // Продолжаем собирать размышление
            currentThought += content;
          } else {
            // Обычный контент
            await sendEvent('content', { content });
          }
        } else {
          // Обычный стриминг для не-курсовых запросов
          await sendEvent('content', { content });
        }
      }
      
      // Проверяем, содержит ли ответ JSON курса
      const courseJsonMatch = fullResponse.match(/<COURSE_JSON>([\s\S]*?)<\/COURSE_JSON>/);
      let courseData = null;
      
      if (courseJsonMatch) {
        try {
          const courseJson = courseJsonMatch[1].trim();
          const parsedData = JSON.parse(courseJson);
          courseData = parsedData.course;
          
          // Отправляем событие о создании курса
          await sendEvent('course', { course: courseData });
        } catch (error) {
          console.error('Failed to parse course JSON:', error);
          await sendEvent('error', { error: 'Failed to parse course structure' });
        }
      }
      
      // Завершаем стрим
      await sendEvent('done', { 
        reply: fullResponse.replace(/<COURSE_JSON>[\s\S]*?<\/COURSE_JSON>/, '').replace(/<THOUGHT>[\s\S]*?<\/THOUGHT>/g, '').trim()
      });
      
    } catch (error) {
      console.error('Chat API error:', error);
      
      if (error instanceof Error) {
        await sendEvent('error', { 
          error: error.message,
          statusCode: 500 
        });
      } else {
        await sendEvent('error', { 
          error: 'Internal server error',
          statusCode: 500 
        });
      }
    } finally {
      await writer.close();
    }
  })();
  
  // Возвращаем поток с правильными заголовками для SSE
  return new Response(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}