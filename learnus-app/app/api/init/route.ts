import { NextResponse } from 'next/server';
import { initDb } from '@/lib/db';

/**
 * GET /api/init
 * Инициализация базы данных
 */
export async function GET() {
  try {
    // Инициализируем базу данных
    await initDb();
    
    return NextResponse.json({
      message: 'Database initialized successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Database initialization error:', error);
    return NextResponse.json(
      { error: 'Failed to initialize database' },
      { status: 500 }
    );
  }
}

