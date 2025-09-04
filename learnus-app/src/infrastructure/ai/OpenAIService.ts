import { injectable } from 'inversify';
import OpenAI from 'openai';
import { IAIService, CourseStructure } from '@application/interfaces/IAIService';
import { Module } from '@domain/entities/Module';
import { Lesson } from '@domain/entities/Lesson';
import { COURSE_CREATION_PROMPT, SOCRATIC_PROMPT } from '@/lib/templates/system_promts';

@injectable()
export class OpenAIService implements IAIService {
  private openai: OpenAI;

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }
    
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateCourse(prompt: string, userLevel: string): Promise<CourseStructure> {
    try {
      const systemPrompt = COURSE_CREATION_PROMPT;
      const userPrompt = `Create a course based on this request: ${prompt}\n\nThe course should be appropriate for ${userLevel} level learners.`;

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      });

      const reply = completion.choices[0]?.message?.content || '';
      
      // Extract JSON from response
      const courseJsonMatch = reply.match(/<COURSE_JSON>([\s\S]*?)<\/COURSE_JSON>/);
      
      if (!courseJsonMatch || !courseJsonMatch[1]) {
        throw new Error('Failed to extract course JSON from AI response');
      }

      const courseData = JSON.parse(courseJsonMatch[1].trim());
      
      // Convert to domain entities
      const modules = await this.convertToModules(courseData.course.modules);
      
      return {
        title: courseData.course.title,
        description: courseData.course.description,
        level: courseData.course.level,
        modules,
      };
    } catch (error) {
      throw new Error(`Failed to generate course: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateSocraticResponse(
    message: string,
    context?: {
      courseTitle?: string;
      currentLesson?: string;
      learningObjectives?: string[];
    }
  ): Promise<string> {
    try {
      let systemPrompt = SOCRATIC_PROMPT;
      
      if (context) {
        systemPrompt += `\n\nCurrent learning context:`;
        if (context.courseTitle) {
          systemPrompt += `\nCourse: ${context.courseTitle}`;
        }
        if (context.currentLesson) {
          systemPrompt += `\nCurrent lesson: ${context.currentLesson}`;
        }
        if (context.learningObjectives && context.learningObjectives.length > 0) {
          systemPrompt += `\nLearning objectives:\n${context.learningObjectives.map((obj, i) => `${i + 1}. ${obj}`).join('\n')}`;
        }
      }

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      return completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
    } catch (error) {
      throw new Error(`Failed to generate response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async convertToModules(modulesData: any[]): Promise<Module[]> {
    const modules: Module[] = [];
    
    for (const moduleData of modulesData) {
      const lessons: Lesson[] = [];
      
      for (const lessonData of moduleData.lessons) {
        const lessonResult = Lesson.create({
          title: lessonData.title,
          type: lessonData.type,
          content: lessonData.content,
          promptsForUser: lessonData.prompts_for_user,
          expectedOutcome: lessonData.expected_outcome,
          hints: lessonData.hints,
        });
        
        if (lessonResult.isFailure) {
          throw new Error(`Failed to create lesson: ${lessonResult.getError().message}`);
        }
        
        lessons.push(lessonResult.getValue());
      }
      
      const moduleResult = Module.create({
        title: moduleData.title,
        learningObjectives: moduleData.learning_objectives,
        lessons,
      });
      
      if (moduleResult.isFailure) {
        throw new Error(`Failed to create module: ${moduleResult.getError().message}`);
      }
      
      modules.push(moduleResult.getValue());
    }
    
    return modules;
  }
}