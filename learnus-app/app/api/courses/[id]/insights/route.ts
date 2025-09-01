import { NextRequest, NextResponse } from 'next/server';
import { openDb } from '@/lib/db';
import { Insight } from '@/lib/types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: courseId } = await params;
    const db = await openDb();
    
    const insights = await db.all(
      `SELECT i.* FROM insights i
       JOIN learning_sessions ls ON i.session_id = ls.id
       WHERE ls.course_id = ?
       ORDER BY i.created_at DESC`,
      [courseId]
    );

    await db.close();

    const insightData: Insight[] = insights.map(i => ({
      id: i.id,
      sessionId: i.session_id,
      blockId: i.block_id,
      type: i.type,
      content: i.content,
      createdAt: i.created_at
    }));

    return NextResponse.json({ data: insightData });
  } catch (error) {
    console.error('Error fetching insights:', error);
    return NextResponse.json(
      { error: 'Ошибка получения инсайтов' },
      { status: 500 }
    );
  }
}