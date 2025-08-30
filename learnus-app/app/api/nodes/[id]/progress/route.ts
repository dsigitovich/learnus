import { NextRequest, NextResponse } from 'next/server';
import { openDb } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { status, notes } = await request.json();
    
    const db = await openDb();
    
    // Обновляем статус узла
    await db.run(
      'UPDATE program_nodes SET status = ? WHERE id = ?',
      [status, resolvedParams.id]
    );
    
    // Добавляем запись о прогрессе
    if (status === 'completed') {
      await db.run(
        'INSERT INTO learning_progress (node_id, status, completed_at, notes) VALUES (?, ?, datetime("now"), ?)',
        [resolvedParams.id, status, notes]
      );
    } else {
      await db.run(
        'INSERT INTO learning_progress (node_id, status, notes) VALUES (?, ?, ?)',
        [resolvedParams.id, status, notes]
      );
    }
    
    await db.close();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    );
  }
}
