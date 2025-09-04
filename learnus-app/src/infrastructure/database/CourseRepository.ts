import { injectable } from 'inversify';
import { ICourseRepository } from '@domain/repositories/ICourseRepository';
import { CourseAggregate } from '@domain/aggregates/CourseAggregate';
import { Result } from '@shared/types/result';

@injectable()
export class CourseRepository implements ICourseRepository {
  private courses: Map<string, CourseAggregate> = new Map();

  async save(_course: CourseAggregate): Promise<Result<void>> {
    try {
      this.courses.set(_course.id, _course);
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }

  async findById(_id: string): Promise<Result<CourseAggregate | null>> {
    try {
      const course = this.courses.get(_id) || null;
      return Result.ok(course);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }

  async findByTitle(_id: string): Promise<Result<CourseAggregate | null>> {
    try {
      const course = Array.from(this.courses.values()).find(c => c.title.value === _id) || null;
      return Result.ok(course);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }

  async findByLevel(_id: string): Promise<Result<CourseAggregate[]>> {
    try {
      const courses = Array.from(this.courses.values()).filter(c => c.level.value === _id);
      return Result.ok(courses);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }
}