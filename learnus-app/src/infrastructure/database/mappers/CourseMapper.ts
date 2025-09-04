import { CourseAggregate } from '@domain/aggregates/CourseAggregate';
import { Module } from '@domain/entities/Module';
import { Lesson } from '@domain/entities/Lesson';

export interface CoursePersistence {
  id: string;
  title: string;
  description: string;
  level: string;
  modules: ModulePersistence[];
  created_at: string;
  updated_at: string;
}

export interface ModulePersistence {
  id: string;
  title: string;
  learning_objectives: string[];
  lessons: LessonPersistence[];
}

export interface LessonPersistence {
  id: string;
  title: string;
  type: 'theory' | 'exercise';
  content: string;
  prompts_for_user: string[];
  expected_outcome: string;
  hints?: string[];
}

export class CourseMapper {
  static toPersistence(course: CourseAggregate): CoursePersistence {
    return {
      id: course.id,
      title: course.title.value,
      description: course.description,
      level: course.level.value,
      modules: course.modules.map(module => ({
        id: module.id,
        title: module.title,
        learning_objectives: module.learningObjectives,
        lessons: module.lessons.map(lesson => ({
          id: lesson.id,
          title: lesson.title,
          type: lesson.type,
          content: lesson.content,
          prompts_for_user: lesson.promptsForUser,
          expected_outcome: lesson.expectedOutcome,
          hints: lesson.hints,
        })),
      })),
      created_at: course.createdAt.toISOString(),
      updated_at: course.updatedAt.toISOString(),
    };
  }

  static toDomain(data: CoursePersistence): CourseAggregate | null {
    try {
      // Convert lessons
      const modules: Module[] = [];
      
      for (const moduleData of data.modules) {
        const lessons: Lesson[] = [];
        
        for (const lessonData of moduleData.lessons) {
          const lessonResult = Lesson.create({
            title: lessonData.title,
            type: lessonData.type,
            content: lessonData.content,
            promptsForUser: lessonData.prompts_for_user,
            expectedOutcome: lessonData.expected_outcome,
            hints: lessonData.hints,
          }, lessonData.id);
          
          if (lessonResult.isFailure) {
            return null;
          }
          
          lessons.push(lessonResult.getValue());
        }
        
        const moduleResult = Module.create({
          title: moduleData.title,
          learningObjectives: moduleData.learning_objectives,
          lessons,
        }, moduleData.id);
        
        if (moduleResult.isFailure) {
          return null;
        }
        
        modules.push(moduleResult.getValue());
      }
      
      // Create course aggregate
      const courseResult = CourseAggregate.create({
        title: data.title,
        description: data.description,
        level: data.level as 'Beginner' | 'Intermediate' | 'Advanced',
        modules,
      }, data.id);
      
      if (courseResult.isFailure) {
        return null;
      }
      
      return courseResult.getValue();
    } catch (error) {
      console.error('Failed to map course from persistence:', error);
      return null;
    }
  }
}