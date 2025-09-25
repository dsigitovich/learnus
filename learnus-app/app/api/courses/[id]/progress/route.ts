import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { GetCourseProgressUseCase } from '@/src/application/use-cases/GetCourseProgressUseCase';
import { UpdateLessonProgressUseCase } from '@/src/application/use-cases/UpdateLessonProgressUseCase';
import { container } from '@/src/shared/container/container';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const courseId = params.id;
    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      );
    }

    const useCase = container.resolve<GetCourseProgressUseCase>('GetCourseProgressUseCase');
    const result = await useCase.execute({
      courseId,
      userId: session.user.id,
    });

    if (result.isFailure()) {
      return NextResponse.json(
        { error: result.getError().message },
        { status: 400 }
      );
    }

    return NextResponse.json(result.getValue());
  } catch (error) {
    console.error('Error getting course progress:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const courseId = params.id;
    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { lessonId, status } = body;

    if (!lessonId || !status) {
      return NextResponse.json(
        { error: 'Lesson ID and status are required' },
        { status: 400 }
      );
    }

    if (!['not_started', 'in_progress', 'completed'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be not_started, in_progress, or completed' },
        { status: 400 }
      );
    }

    const useCase = container.resolve<UpdateLessonProgressUseCase>('UpdateLessonProgressUseCase');
    const result = await useCase.execute({
      courseId,
      lessonId,
      userId: session.user.id,
      status,
    });

    if (result.isFailure()) {
      return NextResponse.json(
        { error: result.getError().message },
        { status: 400 }
      );
    }

    return NextResponse.json(result.getValue());
  } catch (error) {
    console.error('Error updating lesson progress:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}