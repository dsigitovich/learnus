import { injectable } from 'inversify';
import OpenAI from 'openai';
import { IAIService, CourseData, LessonData } from '@application/interfaces/IAIService';
import { Result } from '@shared/types/result';
import { Module } from '@domain/entities/Module';
import { Lesson } from '@domain/entities/Lesson';

@injectable()
export class OpenAIService implements IAIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateCourse(title: string, description: string, level: string): Promise<Result<CourseData>> {
    try {
      // Генерируем уникальный контент на основе запроса пользователя
      const prompt = `Создай структуру курса на тему "${title}". 
Описание: ${description}
Уровень: ${level}

Создай один модуль с одним уроком. Верни JSON в формате:
{
  "moduleTitle": "Название модуля",
  "lessonTitle": "Название урока", 
  "lessonContent": "Содержание урока",
  "learningObjective": "Цель обучения",
  "prompt": "Вопрос для пользователя",
  "expectedOutcome": "Ожидаемый результат",
  "hint": "Подсказка"
}`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "Ты эксперт по созданию образовательных курсов. Отвечай только валидным JSON." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        return Result.fail(new Error('No response from OpenAI'));
      }

      // Парсим JSON ответ
      let courseData;
      try {
        courseData = JSON.parse(response);
      } catch (parseError) {
        // Если не удалось распарсить, используем fallback
        courseData = {
          moduleTitle: `Введение в ${title}`,
          lessonTitle: 'Основы',
          lessonContent: `Изучение основ темы: ${title}`,
          learningObjective: `Понять основы ${title}`,
          prompt: `Что вы знаете о ${title}?`,
          expectedOutcome: `Понимание основ ${title}`,
          hint: 'Начните с простых понятий'
        };
      }

      // Создаем урок
      const lessonResult = Lesson.create({
        title: courseData.lessonTitle || 'Основы',
        type: 'theory',
        content: courseData.lessonContent || `Изучение основ темы: ${title}`,
        promptsForUser: [courseData.prompt || `Что вы знаете о ${title}?`],
        expectedOutcome: courseData.expectedOutcome || `Понимание основ ${title}`,
        hints: [courseData.hint || 'Начните с простых понятий']
      });

      if (lessonResult.isFailure) {
        return Result.fail(lessonResult.getError());
      }

      // Создаем модуль
      const moduleResult = Module.create({
        title: courseData.moduleTitle || `Введение в ${title}`,
        learningObjectives: [courseData.learningObjective || `Понять основы ${title}`],
        lessons: [lessonResult.getValue()]
      });

      if (moduleResult.isFailure) {
        return Result.fail(moduleResult.getError());
      }

      return Result.ok({
        title: title,
        description: description,
        level: level as 'Beginner' | 'Intermediate' | 'Advanced',
        modules: [moduleResult.getValue()],
        course_summary: `Курс по теме: ${title}`
      });
    } catch (error) {
      return Result.fail(error as Error);
    }
  }

  async generateLesson(_prompt: string, _userLevel: string): Promise<Result<LessonData>> {
    // Mock implementation
    return Result.ok({
      title: 'Generated Lesson',
      content: 'Generated content',
      level: _userLevel
    });
  }

  async chat(_message: string, _context: string): Promise<Result<string>> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: "You are a helpful AI assistant." },
          { role: "user", content: _message }
        ],
        temperature: 0.7,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        return Result.fail(new Error('No response from OpenAI'));
      }

      return Result.ok(response);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }
}