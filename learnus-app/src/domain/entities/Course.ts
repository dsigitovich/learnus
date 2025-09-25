import { Entity } from '@shared/types/entity';
import { Result } from '@shared/types/result';
import { Module } from './Module';
import { CourseTitle } from '../value-objects/CourseTitle';
import { CourseLevel } from '../value-objects/CourseLevel';

interface CourseProps {
  title: CourseTitle;
  description: string;
  level: CourseLevel;
  modules: Module[];
  createdAt: Date;
  updatedAt: Date;
}

interface CourseCreateProps {
  title: string;
  description: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  modules: Module[];
}

export class Course extends Entity<CourseProps> {
  get title(): CourseTitle {
    return this.props.title;
  }

  get description(): string {
    return this.props.description;
  }

  get level(): CourseLevel {
    return this.props.level;
  }

  get modules(): Module[] {
    return [...this.props.modules];
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  private constructor(props: CourseProps, id?: string) {
    super(props, id);
  }

  public static create(props: CourseCreateProps, id?: string): Result<Course> {
    try {
      const titleResult = CourseTitle.create(props.title);
      if (titleResult.isFailure) {
        return Result.fail(titleResult.getError());
      }

      const levelResult = CourseLevel.create(props.level);
      if (levelResult.isFailure) {
        return Result.fail(levelResult.getError());
      }

      const now = new Date();
      const course = new Course(
        {
          title: titleResult.getValue(),
          description: props.description,
          level: levelResult.getValue(),
          modules: props.modules,
          createdAt: now,
          updatedAt: now,
        },
        id
      );

      return Result.ok(course);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }

  public updateDescription(description: string): Result<void> {
    if (!description || description.trim() === '') {
      return Result.fail(new Error('Description cannot be empty'));
    }

    this.props.description = description.trim();
    this.props.updatedAt = new Date();
    return Result.ok();
  }

  public addModule(module: Module): Result<void> {
    this.props.modules.push(module);
    this.props.updatedAt = new Date();
    return Result.ok();
  }

  public removeModule(moduleId: string): Result<void> {
    const index = this.props.modules.findIndex(m => m.id === moduleId);
    if (index === -1) {
      return Result.fail(new Error('Module not found'));
    }

    this.props.modules.splice(index, 1);
    this.props.updatedAt = new Date();
    return Result.ok();
  }
}
