import { NextRequest, NextResponse } from 'next/server';
import { openDb } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { status, notes, percentage } = await request.json();
    const nodeId = params.id;
    
    const db = await openDb();
    
    // Обновляем статус узла
    await db.run(
      'UPDATE program_nodes SET status = ? WHERE id = ?',
      [status, nodeId]
    );
    
    // Обновляем или создаем детальный прогресс
    const progressPercentage = status === 'completed' ? 100 : (percentage || 0);
    
    await db.run(
      `INSERT INTO node_progress (node_id, percentage, notes, last_accessed) 
       VALUES (?, ?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(node_id) 
       DO UPDATE SET 
         percentage = ?,
         notes = CASE WHEN ? IS NOT NULL THEN ? ELSE notes END,
         last_accessed = CURRENT_TIMESTAMP`,
      [nodeId, progressPercentage, notes, progressPercentage, notes, notes]
    );
    
    // Записываем в общую таблицу прогресса
    await db.run(
      'INSERT INTO learning_progress (node_id, status, notes) VALUES (?, ?, ?)',
      [nodeId, status, notes]
    );
    
    if (status === 'completed') {
      await db.run(
        'UPDATE learning_progress SET completed_at = CURRENT_TIMESTAMP WHERE node_id = ? AND completed_at IS NULL',
        [nodeId]
      );
    }
    
    // Завершаем текущую сессию обучения, если узел завершен
    if (status === 'completed' || status === 'not_started') {
      await db.run(
        `UPDATE learning_sessions 
         SET ended_at = CURRENT_TIMESTAMP,
             duration_minutes = (strftime('%s', CURRENT_TIMESTAMP) - strftime('%s', started_at)) / 60
         WHERE node_id = ? AND ended_at IS NULL`,
        [nodeId]
      );
    }
    
    await db.close();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating progress:', error);
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const nodeId = params.id;
    
    const db = await openDb();
    
    // Получаем детальный прогресс узла
    const progress = await db.get(
      'SELECT * FROM node_progress WHERE node_id = ?',
      [nodeId]
    );
    
    // Получаем статистику времени
    const timeStats = await db.get(
      `SELECT 
        SUM(duration_minutes) as total_time_spent,
        COUNT(*) as session_count
       FROM learning_sessions 
       WHERE node_id = ? AND duration_minutes IS NOT NULL`,
      [nodeId]
    );
    
    await db.close();
    
    return NextResponse.json({
      progress: progress || { percentage: 0, time_spent_minutes: 0 },
      stats: timeStats
    });
  } catch (error) {
    console.error('Error getting progress:', error);
    return NextResponse.json(
      { error: 'Failed to get progress' },
      { status: 500 }
    );
  }
}