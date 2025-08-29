import { NextRequest, NextResponse } from 'next/server';
import { openDb } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { status, notes } = await request.json();
    
    const db = await openDb();
    
    // Обновляем статус узла
    await db.run(
      'UPDATE program_nodes SET status = ? WHERE id = ?',
      [status, params.id]
    );
    
    // Добавляем запись о прогрессе
    if (status === 'completed') {
      await db.run(
        'INSERT INTO learning_progress (node_id, status, completed_at, notes) VALUES (?, ?, datetime("now"), ?)',
        [params.id, status, notes]
      );
    } else {
      await db.run(
        'INSERT INTO learning_progress (node_id, status, notes) VALUES (?, ?, ?)',
        [params.id, status, notes]
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