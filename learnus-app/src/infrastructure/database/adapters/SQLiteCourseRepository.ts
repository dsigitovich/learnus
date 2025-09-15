import { ICourseRepository } from '../../../domain/repositories/ICourseRepository';
import { Course } from '../../../domain/entities/Course';
import { CourseId } from '../../../domain/value-objects/CourseId';
import { CourseRepository } from '../CourseRepository';

export class SQLiteCourseRepository extends CourseRepository implements ICourseRepository {
  // Наследуем всю функциональность от основного CourseRepository
}

