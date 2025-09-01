import { NextRequest, NextResponse } from 'next/server';
import { openDb } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { node_id } = await request.json();
    const programId = params.id;
    
    const db = await openDb();
    
    // Обновляем текущую позицию в программе
    await db.run(
      'UPDATE learning_programs SET current_node_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [node_id, programId]
    );
    
    // Создаем или обновляем запись прогресса для узла
    await db.run(
      `INSERT INTO node_progress (node_id, last_accessed) 
       VALUES (?, CURRENT_TIMESTAMP)
       ON CONFLICT(node_id) 
       DO UPDATE SET last_accessed = CURRENT_TIMESTAMP`,
      [node_id]
    );
    
    // Создаем новую сессию обучения
    await db.run(
      'INSERT INTO learning_sessions (program_id, node_id) VALUES (?, ?)',
      [programId, node_id]
    );
    
    await db.close();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating position:', error);
    return NextResponse.json(
      { error: 'Failed to update position' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const programId = params.id;
    
    const db = await openDb();
    
    // Получаем текущую позицию
    const program = await db.get(
      'SELECT current_node_id FROM learning_programs WHERE id = ?',
      [programId]
    );
    
    if (!program || !program.current_node_id) {
      await db.close();
      return NextResponse.json({ current_node_id: null });
    }
    
    // Получаем информацию о текущем узле
    const node = await db.get(
      'SELECT * FROM program_nodes WHERE id = ?',
      [program.current_node_id]
    );
    
    // Получаем прогресс узла
    const progress = await db.get(
      'SELECT * FROM node_progress WHERE node_id = ?',
      [program.current_node_id]
    );
    
    await db.close();
    
    return NextResponse.json({
      current_node_id: program.current_node_id,
      node,
      progress
    });
  } catch (error) {
    console.error('Error getting position:', error);
    return NextResponse.json(
      { error: 'Failed to get position' },
      { status: 500 }
    );
  }
}