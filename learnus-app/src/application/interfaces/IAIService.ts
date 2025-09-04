import { Module } from '@domain/entities/Module';

export interface CourseStructure {
  title: string;
  description: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  modules: Module[];
}

export interface IAIService {
  generateCourse(prompt: string, userLevel: string): Promise<CourseStructure>;
  generateSocraticResponse(
    message: string,
    context?: {
      courseTitle?: string;
      currentLesson?: string;
      learningObjectives?: string[];
    }
  ): Promise<string>;
}