import { NextRequest, NextResponse } from 'next/server';
import 'reflect-metadata';
import { container } from '@shared/container/container';
import { TYPES } from '@shared/container/types';
import { CreateCourseUseCase } from '@application/use-cases/CreateCourseUseCase';
import { CreateCourseSchema } from '@application/dto/CreateCourseDto';
import { ICourseRepository } from '@domain/repositories/ICourseRepository';

/**
 * GET /api/courses
 * Get all courses
 */
export async function GET() {
  try {
    const courseRepository = container.get<ICourseRepository>(TYPES.ICourseRepository);
    const courses = await courseRepository.findAll();
    
    const coursesData = courses.map(course => ({
      id: course.id,
      title: course.title.value,
      description: course.description,
      level: course.level.value,
      totalModules: course.modules.length,
      totalLessons: course.getTotalLessons(),
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
    }));
    
    return NextResponse.json({
      data: coursesData,
    });
  } catch (error) {
    console.error('Get courses error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/courses
 * Create a new course
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request
    const validation = CreateCourseSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: validation.error.errors 
        },
        { status: 400 }
      );
    }
    
    // Execute use case
    const createCourseUseCase = container.get<CreateCourseUseCase>(TYPES.CreateCourseUseCase);
    const result = await createCourseUseCase.execute(validation.data);
    
    if (result.isFailure) {
      return NextResponse.json(
        { error: result.getError().message },
        { status: 400 }
      );
    }
    
    const courseResponse = result.getValue();
    
    return NextResponse.json({
      data: courseResponse,
      message: 'Course created successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Create course error:', error);
    
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
}