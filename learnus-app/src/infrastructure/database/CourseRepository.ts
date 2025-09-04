import { injectable } from 'inversify';
import { ICourseRepository } from '@domain/repositories/ICourseRepository';
import { CourseAggregate } from '@domain/aggregates/CourseAggregate';
import { CourseMapper, CoursePersistence } from './mappers/CourseMapper';

@injectable()
export class CourseRepository implements ICourseRepository {
  // In-memory storage for now, will be replaced with SQLite
  private courses: Map<string, CoursePersistence> = new Map();

  async save(course: CourseAggregate): Promise<void> {
    const persistence = CourseMapper.toPersistence(course);
    this.courses.set(course.id, persistence);
  }

  async findById(id: string): Promise<CourseAggregate | null> {
    const persistence = this.courses.get(id);
    if (!persistence) {
      return null;
    }
    return CourseMapper.toDomain(persistence);
  }

  async findAll(): Promise<CourseAggregate[]> {
    const courses: CourseAggregate[] = [];
    
    for (const persistence of this.courses.values()) {
      const course = CourseMapper.toDomain(persistence);
      if (course) {
        courses.push(course);
      }
    }
    
    return courses;
  }

  async delete(id: string): Promise<void> {
    this.courses.delete(id);
  }

  async exists(id: string): Promise<boolean> {
    return this.courses.has(id);
  }
}