import { NextRequest, NextResponse } from 'next/server';
import { openDb } from '@/lib/db';

export async function GET() {
  try {
    const db = await openDb();
    const programs = await db.all('SELECT * FROM learning_programs ORDER BY created_at DESC');
    await db.close();
    
    return NextResponse.json(programs);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch programs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, description } = await request.json();
    
    const db = await openDb();
    const result = await db.run(
      'INSERT INTO learning_programs (title, description) VALUES (?, ?)',
      [title, description]
    );
    
    const program = await db.get(
      'SELECT * FROM learning_programs WHERE id = ?',
      [result.lastID]
    );
    
    await db.close();
    
    return NextResponse.json(program);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create program' },
      { status: 500 }
    );
  }
}
