import { Result } from '@shared/types/result';
import { Module } from '@domain/entities/Module';

export interface CourseData {
  title: string;
  description: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  modules: Module[];
  course_summary: string;
}

export interface LessonData {
  title: string;
  content: string;
  level: string;
}

export interface IAIService {
  generateCourse(_title: string, _description: string, _level: string): Promise<Result<CourseData>>;
  generateLesson(_prompt: string, _userLevel: string): Promise<Result<LessonData>>;
  chat(_message: string, _context: string): Promise<Result<string>>;
}