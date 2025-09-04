import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { UserRepository } from '@/infrastructure/database/UserRepository';
import { UserMapper } from '@/infrastructure/database/mappers/UserMapper';
import Database from 'better-sqlite3';
import { z } from 'zod';

const db = new Database('./socrademy.db');
const userRepository = new UserRepository(db);

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

    const userResult = await userRepository.findById(session.user.id);
    
    if (userResult.isFailure) {
      return NextResponse.json(
        { error: 'Failed to fetch user data' },
        { status: 500 }
      );
    }

    const user = userResult.getValue();
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const { name, bio, level, interests, avatarUrl } = validationResult.data;

    // Обновляем поля пользователя
    if (name !== undefined) {
      const nameResult = user.updateName(name);
      if (nameResult.isFailure) {
        return NextResponse.json(
          { error: nameResult.getError().message },
          { status: 400 }
        );
      }
    }

    if (bio !== undefined) {
      const bioResult = user.updateBio(bio);
      if (bioResult.isFailure) {
        return NextResponse.json(
          { error: bioResult.getError().message },
          { status: 400 }
        );
      }
    }

    if (level !== undefined) {
      const { UserLevel } = await import('@/domain/value-objects/UserLevel');
      user.updateLevel(new UserLevel(level));
    }

    if (interests !== undefined) {
      const interestsResult = user.updateInterests(interests);
      if (interestsResult.isFailure) {
        return NextResponse.json(
          { error: interestsResult.getError().message },
          { status: 400 }
        );
      }
    }

    if (avatarUrl !== undefined) {
      user.updateAvatar(avatarUrl);
    }

    // Сохраняем изменения в базе данных
    const updateResult = await userRepository.update(user);
    
    if (updateResult.isFailure) {
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      );
    }

    const updatedUserDTO = UserMapper.toDTO(user);

    return NextResponse.json({
      data: updatedUserDTO,
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