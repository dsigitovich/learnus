import { CourseAggregate } from '../aggregates/CourseAggregate';
import { Result } from '@shared/types/result';

export interface ICourseRepository {
  save(_course: CourseAggregate): Promise<Result<void>>;
  findById(_id: string): Promise<Result<CourseAggregate | null>>;
  findByTitle(_id: string): Promise<Result<CourseAggregate | null>>;
  findByLevel(_id: string): Promise<Result<CourseAggregate[]>>;
}