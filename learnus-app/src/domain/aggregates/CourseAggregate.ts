import { AggregateRoot } from '@shared/types/aggregate-root';
import { Result } from '@shared/types/result';
import { CourseTitle } from '../value-objects/CourseTitle';
import { CourseLevel } from '../value-objects/CourseLevel';
import { Module } from '../entities/Module';

interface CourseAggregateProps {
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

export class CourseAggregate extends AggregateRoot<CourseAggregateProps> {
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
    return this.props.modules;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  private constructor(props: CourseAggregateProps, id?: string) {
    super(props, id);
  }

  public static create(props: CourseCreateProps, id?: string): Result<CourseAggregate> {
    // Validate title
    const titleResult = CourseTitle.create(props.title);
    if (titleResult.isFailure) {
      return Result.fail(new Error(`Invalid title: ${titleResult.getError().message}`));
    }

    // Validate description
    if (!props.description || props.description.trim() === '') {
      return Result.fail(new Error('Course description cannot be empty'));
    }

    // Validate level
    const levelResult = CourseLevel.create(props.level);
    if (levelResult.isFailure) {
      return Result.fail(new Error(`Invalid level: ${levelResult.getError().message}`));
    }

    // Validate modules
    if (!props.modules || props.modules.length === 0) {
      return Result.fail(new Error('Course must have at least one module'));
    }

    const now = new Date();
    const course = new CourseAggregate(
      {
        title: titleResult.getValue(),
        description: props.description.trim(),
        level: levelResult.getValue(),
        modules: props.modules,
        createdAt: now,
        updatedAt: now,
      },
      id
    );

    return Result.ok(course);
  }

  public canBeAccessedBy(userLevel: CourseLevel): boolean {
    return this.level.canAccess(userLevel);
  }

  public addModule(module: Module): void {
    this.props.modules.push(module);
    this.props.updatedAt = new Date();
  }

  public removeModule(moduleId: string): Result<void> {
    const moduleIndex = this.props.modules.findIndex(m => m.id === moduleId);
    
    if (moduleIndex === -1) {
      return Result.fail(new Error('Module not found in course'));
    }

    if (this.props.modules.length === 1) {
      return Result.fail(new Error('Course must have at least one module'));
    }

    this.props.modules.splice(moduleIndex, 1);
    this.props.updatedAt = new Date();
    return Result.ok();
  }

  public getModuleById(moduleId: string): Module | undefined {
    return this.props.modules.find(m => m.id === moduleId);
  }

  public getTotalLessons(): number {
    return this.props.modules.reduce((total, module) => {
      return total + module.getTotalLessons();
    }, 0);
  }

  public updateDescription(newDescription: string): Result<void> {
    if (!newDescription || newDescription.trim() === '') {
      return Result.fail(new Error('Course description cannot be empty'));
    }

    this.props.description = newDescription.trim();
    this.props.updatedAt = new Date();
    return Result.ok();
  }
}