import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { UserRepository } from '@/infrastructure/database/UserRepository';
import { UserMapper } from '@/infrastructure/database/mappers/UserMapper';
import Database from 'better-sqlite3';

const db = new Database('./socrademy.db');
const userRepository = new UserRepository(db);

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
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

    const userDTO = UserMapper.toDTO(user);

    return NextResponse.json({
      data: userDTO,
      message: 'User profile fetched successfully'
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}