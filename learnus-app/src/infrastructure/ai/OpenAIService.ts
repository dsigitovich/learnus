import { injectable } from 'inversify';
import OpenAI from 'openai';
import { IAIService, CourseData, LessonData } from '@application/interfaces/IAIService';
import { Result } from '@shared/types/result';

@injectable()
export class OpenAIService implements IAIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateCourse(_title: string, _description: string, _level: string): Promise<Result<CourseData>> {
    try {
      // Mock implementation for now
      return Result.ok({
        title: _title,
        description: _description,
        level: _level as 'Beginner' | 'Intermediate' | 'Advanced',
        modules: [],
        course_summary: 'Generated course summary'
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