import { NextRequest, NextResponse } from 'next/server';
import { openDb } from '@/lib/db';
import { UserProgress } from '@/lib/types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: courseId } = await params;
    const db = await openDb();
    
    const progress = await db.get(
      'SELECT * FROM user_course_progress WHERE course_id = ?',
      [courseId]
    );

    if (!progress) {
      await db.close();
      return NextResponse.json(
        { error: 'Прогресс не найден' },
        { status: 404 }
      );
    }

    await db.close();

    const userProgress: UserProgress = {
      courseId: progress.course_id,
      completedBlocks: JSON.parse(progress.completed_blocks || '[]'),
      totalInsights: progress.total_insights,
      progressPercentage: progress.progress_percentage,
      lastActiveAt: progress.last_active_at
    };

    return NextResponse.json({ data: userProgress });
  } catch (error) {
    console.error('Error fetching progress:', error);
    return NextResponse.json(
      { error: 'Ошибка получения прогресса' },
      { status: 500 }
    );
  }
}