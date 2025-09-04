import { Entity } from '@shared/types/entity';
import { Result } from '@shared/types/result';

export type LessonType = 'theory' | 'exercise';

interface LessonProps {
  title: string;
  type: LessonType;
  content: string;
  promptsForUser: string[];
  expectedOutcome: string;
  hints?: string[];
}

export class Lesson extends Entity<LessonProps> {
  get title(): string {
    return this.props.title;
  }

  get type(): LessonType {
    return this.props.type;
  }

  get content(): string {
    return this.props.content;
  }

  get promptsForUser(): string[] {
    return this.props.promptsForUser;
  }

  get expectedOutcome(): string {
    return this.props.expectedOutcome;
  }

  get hints(): string[] | undefined {
    return this.props.hints;
  }

  private constructor(props: LessonProps, id?: string) {
    super(props, id);
  }

  public static create(props: LessonProps, id?: string): Result<Lesson> {
    // Validate title
    if (!props.title || props.title.trim() === '') {
      return Result.fail(new Error('Lesson title cannot be empty'));
    }

    // Validate type
    if (!['theory', 'exercise'].includes(props.type)) {
      return Result.fail(new Error('Invalid lesson type'));
    }

    // Validate content
    if (!props.content || props.content.trim() === '') {
      return Result.fail(new Error('Lesson content cannot be empty'));
    }

    // Validate prompts
    if (!props.promptsForUser || props.promptsForUser.length === 0) {
      return Result.fail(new Error('Lesson must have at least one prompt for user'));
    }

    // Validate expected outcome
    if (!props.expectedOutcome || props.expectedOutcome.trim() === '') {
      return Result.fail(new Error('Expected outcome cannot be empty'));
    }

    const lesson = new Lesson(
      {
        title: props.title.trim(),
        type: props.type,
        content: props.content.trim(),
        promptsForUser: props.promptsForUser.map(p => p.trim()).filter(p => p.length > 0),
        expectedOutcome: props.expectedOutcome.trim(),
        hints: props.hints?.map(h => h.trim()).filter(h => h.length > 0),
      },
      id
    );

    return Result.ok(lesson);
  }

  public isTheory(): boolean {
    return this.type === 'theory';
  }

  public isExercise(): boolean {
    return this.type === 'exercise';
  }

  public addHint(hint: string): Result<void> {
    if (!hint || hint.trim() === '') {
      return Result.fail(new Error('Hint cannot be empty'));
    }

    if (!this.props.hints) {
      this.props.hints = [];
    }

    this.props.hints.push(hint.trim());
    return Result.ok();
  }
}