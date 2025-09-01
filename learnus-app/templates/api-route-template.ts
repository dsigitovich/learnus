import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { openDb } from '@/lib/db';

// Схемы валидации
const CreateDataSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().optional(),
  // Добавьте другие поля по необходимости
});

const UpdateDataSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  // Добавьте другие поля по необходимости
});

// Типы
type CreateDataRequest = z.infer<typeof CreateDataSchema>;
type UpdateDataRequest = z.infer<typeof UpdateDataSchema>;

// Вспомогательные функции
function handleApiError(error: unknown): NextResponse {
  console.error('API Error:', error);
  
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { 
        error: 'Validation failed', 
        details: error.errors 
      },
      { status: 400 }
    );
  }
  
  if (error instanceof Error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
  
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}

// GET - получение данных
export async function GET(
  request: NextRequest,
  { params }: { params: { id?: string } }
) {
  try {
    const db = await openDb();
    
    if (params.id) {
      // Получение конкретного элемента
      const item = await db.get(
        'SELECT * FROM table_name WHERE id = ?',
        [params.id]
      );
      
      await db.close();
      
      if (!item) {
        return NextResponse.json(
          { error: 'Item not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(item);
    } else {
      // Получение списка элементов
      const items = await db.all('SELECT * FROM table_name ORDER BY created_at DESC');
      await db.close();
      
      return NextResponse.json({ items });
    }
  } catch (error) {
    return handleApiError(error);
  }
}

// POST - создание данных
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = CreateDataSchema.parse(body);
    
    const db = await openDb();
    
    const result = await db.run(
      `INSERT INTO table_name (title, description, created_at) 
       VALUES (?, ?, CURRENT_TIMESTAMP)`,
      [validatedData.title, validatedData.description]
    );
    
    // Получаем созданный элемент
    const createdItem = await db.get(
      'SELECT * FROM table_name WHERE id = ?',
      [result.lastID]
    );
    
    await db.close();
    
    return NextResponse.json(createdItem, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT - обновление данных
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validatedData = UpdateDataSchema.parse(body);
    
    const db = await openDb();
    
    // Проверяем существование элемента
    const existingItem = await db.get(
      'SELECT * FROM table_name WHERE id = ?',
      [params.id]
    );
    
    if (!existingItem) {
      await db.close();
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }
    
    // Обновляем элемент
    const updateFields = [];
    const updateValues = [];
    
    if (validatedData.title !== undefined) {
      updateFields.push('title = ?');
      updateValues.push(validatedData.title);
    }
    
    if (validatedData.description !== undefined) {
      updateFields.push('description = ?');
      updateValues.push(validatedData.description);
    }
    
    if (updateFields.length === 0) {
      await db.close();
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }
    
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(params.id);
    
    await db.run(
      `UPDATE table_name SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );
    
    // Получаем обновленный элемент
    const updatedItem = await db.get(
      'SELECT * FROM table_name WHERE id = ?',
      [params.id]
    );
    
    await db.close();
    
    return NextResponse.json(updatedItem);
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE - удаление данных
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = await openDb();
    
    // Проверяем существование элемента
    const existingItem = await db.get(
      'SELECT * FROM table_name WHERE id = ?',
      [params.id]
    );
    
    if (!existingItem) {
      await db.close();
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }
    
    // Удаляем элемент
    await db.run('DELETE FROM table_name WHERE id = ?', [params.id]);
    await db.close();
    
    return NextResponse.json(
      { message: 'Item deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
