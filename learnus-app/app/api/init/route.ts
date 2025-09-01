import { NextResponse } from 'next/server';
import { initializeDatabase, checkDatabaseHealth } from '@/lib/db';
import { handleApiError } from '@/lib/utils/error-handler';

/**
 * POST /api/init
 * Инициализировать базу данных
 */
export async function POST() {
  try {
    // Инициализируем БД
    await initializeDatabase();
    
    // Проверяем состояние
    const health = await checkDatabaseHealth();
    
    return NextResponse.json({
      message: 'Database initialized successfully',
      health,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * GET /api/init
 * Проверить состояние базы данных
 */
export async function GET() {
  try {
    const health = await checkDatabaseHealth();
    
    return NextResponse.json({
      data: health,
    });
  } catch (error) {
    return handleApiError(error);
  }
}