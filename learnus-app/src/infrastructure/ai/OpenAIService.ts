import OpenAI from 'openai';
import { Result } from '@shared/types/result';
import { IAIService, CourseData, LessonData } from '../../application/interfaces/IAIService';


export class OpenAIService implements IAIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateCourse(title: string, description: string, level: string): Promise<Result<CourseData>> {
    try {
      const prompt = `Создай курс по программированию на тему "${title}".
Описание: ${description}
Уровень: ${level}

Верни JSON с полями:
- title: название курса
- description: описание курса
- level: уровень курса
- modules: массив модулей
- course_summary: краткое резюме курса

Формат JSON:
{
  "title": "...",
  "description": "...",
  "level": "${level}",
  "modules": [
    {
      "title": "Название модуля",
      "description": "Описание модуля",
      "lessons": [
        {
          "title": "Название урока",
          "content": "Содержание урока",
          "type": "theory"
        }
      ]
    }
  ],
  "course_summary": "..."
}`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 2000,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        return Result.fail(new Error('No response from OpenAI'));
      }

      // Парсим JSON ответ
      let courseData;
      try {
        courseData = JSON.parse(response);
      } catch {
        // Если не удалось распарсить, используем fallback
        courseData = {
          title: title,
          description: description,
          level: level as 'Beginner' | 'Intermediate' | 'Advanced',
          modules: [
            {
              title: `Введение в ${title}`,
              description: `Основы ${title}`,
              lessons: [
                {
                  title: 'Основы',
                  content: `Этот курс поможет вам изучить ${title}. ${description}`,
                  type: 'theory' as const
                }
              ]
            }
          ],
          course_summary: `Курс по изучению ${title} для уровня ${level}`
        };
      }

      return Result.ok(courseData);
    } catch (error) {
      return Result.fail(new Error(`Failed to generate course: ${(error as Error).message}`));
    }
  }

  async generateLesson(prompt: string, userLevel: string): Promise<Result<LessonData>> {
    try {
      const systemPrompt = `Ты - опытный преподаватель программирования. 
Создай урок для пользователя уровня ${userLevel}.
Урок должен быть практичным и понятным.`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        return Result.fail(new Error('No response from OpenAI'));
      }

      // Парсим JSON ответ
      let lessonData;
      try {
        lessonData = JSON.parse(response);
      } catch {
        lessonData = {
          title: 'Новый урок',
          content: response,
          level: userLevel
        };
      }

      return Result.ok(lessonData);
    } catch (error) {
      return Result.fail(new Error(`Failed to generate lesson: ${(error as Error).message}`));
    }
  }

  async chat(message: string, context: string): Promise<Result<string>> {
    try {
      const systemPrompt = `Ты - ИИ-помощник для изучения программирования.
Контекст: ${context}
Отвечай кратко и по делу.`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        return Result.fail(new Error('No response from OpenAI'));
      }

      return Result.ok(response);
    } catch (error) {
      return Result.fail(new Error(`Failed to chat: ${(error as Error).message}`));
    }
  }

  async generateResponse(message: string, systemPrompt: string): Promise<string> {
    const completion = await this.openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    return response;
  }
}
