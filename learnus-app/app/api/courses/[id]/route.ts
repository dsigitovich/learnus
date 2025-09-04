import { NextRequest, NextResponse } from 'next/server';
import 'reflect-metadata';
import { container } from '@shared/container/container';
import { TYPES } from '@shared/container/types';
import { ICourseRepository } from '@domain/repositories/ICourseRepository';
import { CourseMapper } from '@infrastructure/database/mappers/CourseMapper';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/courses/[id]
 * Get a specific course by ID
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const courseRepository = container.get<ICourseRepository>(TYPES.ICourseRepository);
    const courseResult = await courseRepository.findById(id);
    
    if (courseResult.isFailure) {
      return NextResponse.json(
        { error: courseResult.getError().message },
        { status: 500 }
      );
    }
    
    const course = courseResult.getValue();
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }
    
    const courseData = CourseMapper.toPersistence(course);
    
    return NextResponse.json({
      data: courseData,
    });
  } catch (error) {
    console.error('Get course error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch course' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/courses/[id]
 * Delete a course
 */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const courseRepository = container.get<ICourseRepository>(TYPES.ICourseRepository);
    
    const courseResult = await courseRepository.findById(id);
    if (courseResult.isFailure) {
      return NextResponse.json(
        { error: courseResult.getError().message },
        { status: 500 }
      );
    }
    
    const course = courseResult.getValue();
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }
    
    // Note: delete method not implemented yet
    return NextResponse.json(
      { error: 'Delete method not implemented yet' },
      { status: 501 }
    );
    
    return NextResponse.json({
      message: 'Course deleted successfully',
    });
  } catch (error) {
    console.error('Delete course error:', error);
    return NextResponse.json(
      { error: 'Failed to delete course' },
      { status: 500 }
    );
  }
}
