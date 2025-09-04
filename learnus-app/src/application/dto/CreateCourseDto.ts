import { z } from 'zod';

export const CreateCourseSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(1000),
  level: z.enum(['Beginner', 'Intermediate', 'Advanced']),
  prompt: z.string().min(10).max(2000),
});

export type CreateCourseDto = z.infer<typeof CreateCourseSchema>;

export interface CreateCourseResponse {
  courseId: string;
  title: string;
  description: string;
  level: string;
  totalModules: number;
  totalLessons: number;
}