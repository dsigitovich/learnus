import { Entity } from '@shared/types/entity';
import { Result } from '@shared/types/result';
import { Lesson } from './Lesson';

interface ModuleProps {
  title: string;
  learningObjectives: string[];
  lessons: Lesson[];
}

export class Module extends Entity<ModuleProps> {
  get title(): string {
    return this.props.title;
  }

  get learningObjectives(): string[] {
    return this.props.learningObjectives;
  }

  get lessons(): Lesson[] {
    return this.props.lessons;
  }

  private constructor(props: ModuleProps, id?: string) {
    super(props, id);
  }

  public static create(props: ModuleProps, id?: string): Result<Module> {
    // Validate title
    if (!props.title || props.title.trim() === '') {
      return Result.fail(new Error('Module title cannot be empty'));
    }

    // Validate learning objectives
    if (!props.learningObjectives || props.learningObjectives.length === 0) {
      return Result.fail(new Error('Module must have at least one learning objective'));
    }

    // Validate lessons
    if (!props.lessons || props.lessons.length === 0) {
      return Result.fail(new Error('Module must have at least one lesson'));
    }

    const newModule = new Module(
      {
        title: props.title.trim(),
        learningObjectives: props.learningObjectives
          .map(obj => obj.trim())
          .filter(obj => obj.length > 0),
        lessons: props.lessons,
      },
      id
    );

    return Result.ok(newModule);
  }

  public addLesson(lesson: Lesson): void {
    this.props.lessons.push(lesson);
  }

  public removeLesson(lessonId: string): Result<void> {
    const lessonIndex = this.props.lessons.findIndex(l => l.id === lessonId);
    
    if (lessonIndex === -1) {
      return Result.fail(new Error('Lesson not found in module'));
    }

    if (this.props.lessons.length === 1) {
      return Result.fail(new Error('Module must have at least one lesson'));
    }

    this.props.lessons.splice(lessonIndex, 1);
    return Result.ok();
  }

  public getLessonById(lessonId: string): Lesson | undefined {
    return this.props.lessons.find(l => l.id === lessonId);
  }

  public getTotalLessons(): number {
    return this.props.lessons.length;
  }
}