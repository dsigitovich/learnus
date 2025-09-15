import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { container } from '@shared/container/container';
import { TYPES } from '@shared/container/types';
import { IUserRepository } from '@domain/repositories/IUserRepository';

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
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

    return NextResponse.json({
      data: {
        id: user.id.value,
        email: user.email.value,
        name: user.name,
        avatarUrl: user.avatarUrl,
        userLevel: user.userLevel?.value
      },
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