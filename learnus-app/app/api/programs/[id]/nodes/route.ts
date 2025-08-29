import { NextRequest, NextResponse } from 'next/server';
import { openDb } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = await openDb();
    const nodes = await db.all(
      'SELECT * FROM program_nodes WHERE program_id = ?',
      [params.id]
    );
    await db.close();
    
    return NextResponse.json(nodes);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch nodes' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { parent_id, title, description, content, position_x, position_y } = await request.json();
    
    const db = await openDb();
    const result = await db.run(
      `INSERT INTO program_nodes (program_id, parent_id, title, description, content, position_x, position_y) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [params.id, parent_id, title, description, content, position_x, position_y]
    );
    
    const node = await db.get(
      'SELECT * FROM program_nodes WHERE id = ?',
      [result.lastID]
    );
    
    await db.close();
    
    return NextResponse.json(node);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create node' },
      { status: 500 }
    );
  }
}