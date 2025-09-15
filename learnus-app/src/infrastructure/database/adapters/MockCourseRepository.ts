import { ICourseRepository } from '../../../domain/repositories/ICourseRepository';
import { Course } from '../../../domain/entities/Course';
import { CourseId } from '../../../domain/value-objects/CourseId';
import { Result } from '../../../../shared/types/result';

export class MockCourseRepository implements ICourseRepository {
  private courses: Map<string, Course> = new Map();

  async save(course: Course): Promise<void> {
    this.courses.set(course.id.value, course);
  }

  async findById(id: CourseId): Promise<Course | null> {
    return this.courses.get(id.value) || null;
  }

  async findAll(): Promise<Course[]> {
    return Array.from(this.courses.values());
  }

  async findByUserId(userId: string): Promise<Course[]> {
    // Мок-реализация - возвращаем все курсы
    return Array.from(this.courses.values());
  }

  async delete(id: CourseId): Promise<void> {
    this.courses.delete(id.value);
  }

  async exists(id: CourseId): Promise<boolean> {
    return this.courses.has(id.value);
  }
}

