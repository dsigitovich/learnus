import { CourseProgress } from '../entities/CourseProgress';
import { Result } from '@shared/types/result';

export interface ICourseProgressRepository {
  save(courseProgress: CourseProgress): Promise<Result<void, Error>>;
  findById(id: string): Promise<Result<CourseProgress | null, Error>>;
  findByCourseIdAndUserId(courseId: string, userId: string): Promise<Result<CourseProgress | null, Error>>;
  findByUserId(userId: string): Promise<Result<CourseProgress[], Error>>;
  delete(id: string): Promise<Result<void, Error>>;
}