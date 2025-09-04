import { CourseAggregate } from '../aggregates/CourseAggregate';

export interface ICourseRepository {
  save(course: CourseAggregate): Promise<void>;
  findById(id: string): Promise<CourseAggregate | null>;
  findAll(): Promise<CourseAggregate[]>;
  delete(id: string): Promise<void>;
  exists(id: string): Promise<boolean>;
}