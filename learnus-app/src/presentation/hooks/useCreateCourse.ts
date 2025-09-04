import { useState } from 'react';
import { CreateCourseDto } from '@application/dto/CreateCourseDto';
import { Result } from '@shared/types/result';

interface CreateCourseResult {
  courseId: string;
  title: string;
  description: string;
  level: string;
  totalModules: number;
  totalLessons: number;
}

export function useCreateCourse() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCourse = async (data: CreateCourseDto): Promise<Result<CreateCourseResult>> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Failed to create course');
        return Result.fail(new Error(result.error || 'Failed to create course'));
      }

      return Result.ok(result.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return Result.fail(new Error(errorMessage));
    } finally {
      setLoading(false);
    }
  };

  return {
    createCourse,
    loading,
    error,
  };
}