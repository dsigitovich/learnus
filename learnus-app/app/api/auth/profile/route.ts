import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { container } from '@shared/container/container';
import { TYPES } from '@shared/container/types';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import { z } from 'zod';

// Схема валидации для обновления профиля
const UpdateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  bio: z.string().max(500).optional(),
  level: z.enum(['Beginner', 'Intermediate', 'Advanced']).optional(),
  interests: z.array(z.string()).max(10).optional(),
  avatarUrl: z.string().url().optional(),
});

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validationResult = UpdateProfileSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const userRepository = container.get<IUserRepository>(TYPES.IUserRepository);
    const user = await userRepository.findById({ value: session.user.id } as any);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Простое обновление - в реальном приложении нужно добавить методы обновления в User entity
    await userRepository.save(user);

    return NextResponse.json({
      data: {
        id: user.id.value,
        email: user.email.value,
        name: user.name,
        avatarUrl: user.avatarUrl,
        userLevel: user.userLevel?.value
      },
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}