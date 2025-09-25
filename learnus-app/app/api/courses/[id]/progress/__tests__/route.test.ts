import { NextRequest } from 'next/server';
import { GET, PUT } from '../route';
import { getServerSession } from 'next-auth';
import { container } from '@/src/shared/container/container';

// Mock dependencies
jest.mock('next-auth');
jest.mock('@/lib/auth');
jest.mock('@/src/shared/container/container');

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;
const mockContainer = container as jest.Mocked<typeof container>;

describe('/api/courses/[id]/progress', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('should return course progress successfully', async () => {
      // Arrange
      const mockSession = {
        user: { id: 'user-1', name: 'Test User', email: 'test@example.com' }
      };
      mockGetServerSession.mockResolvedValue(mockSession as any);

      const mockUseCase = {
        execute: jest.fn().mockResolvedValue({
          isSuccess: true,
          getValue: () => ({
            success: true,
            courseProgress: {
              id: 'progress-1',
              courseId: 'course-1',
              userId: 'user-1',
              completionPercentage: 50,
              overallStatus: 'В процессе',
              totalLessons: 4,
              completedLessons: 2,
              inProgressLessons: 1,
              notStartedLessons: 1,
            }
          })
        })
      };

      mockContainer.get.mockReturnValue(mockUseCase);

      const request = new NextRequest('http://localhost:3000/api/courses/course-1/progress');
      const params = { id: 'course-1' };

      // Act
      const response = await GET(request, { params });

      // Assert
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.courseProgress.courseId).toBe('course-1');
      expect(mockUseCase.execute).toHaveBeenCalledWith({
        courseId: 'course-1',
        userId: 'user-1',
      });
    });

    it('should return 401 when user is not authenticated', async () => {
      // Arrange
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/courses/course-1/progress');
      const params = { id: 'course-1' };

      // Act
      const response = await GET(request, { params });

      // Assert
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 400 when course ID is missing', async () => {
      // Arrange
      const mockSession = {
        user: { id: 'user-1', name: 'Test User', email: 'test@example.com' }
      };
      mockGetServerSession.mockResolvedValue(mockSession as any);

      const request = new NextRequest('http://localhost:3000/api/courses//progress');
      const params = { id: '' };

      // Act
      const response = await GET(request, { params });

      // Assert
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Course ID is required');
    });

    it('should return 400 when use case fails', async () => {
      // Arrange
      const mockSession = {
        user: { id: 'user-1', name: 'Test User', email: 'test@example.com' }
      };
      mockGetServerSession.mockResolvedValue(mockSession as any);

      const mockUseCase = {
        execute: jest.fn().mockResolvedValue({
          isSuccess: false,
          getError: () => new Error('Course not found')
        })
      };

      mockContainer.get.mockReturnValue(mockUseCase);

      const request = new NextRequest('http://localhost:3000/api/courses/course-1/progress');
      const params = { id: 'course-1' };

      // Act
      const response = await GET(request, { params });

      // Assert
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Course not found');
    });
  });

  describe('PUT', () => {
    it('should update lesson progress successfully', async () => {
      // Arrange
      const mockSession = {
        user: { id: 'user-1', name: 'Test User', email: 'test@example.com' }
      };
      mockGetServerSession.mockResolvedValue(mockSession as any);

      const mockUseCase = {
        execute: jest.fn().mockResolvedValue({
          isSuccess: true,
          getValue: () => ({
            success: true,
            message: 'Lesson progress updated successfully',
            courseProgress: {
              id: 'progress-1',
              courseId: 'course-1',
              userId: 'user-1',
              completionPercentage: 75,
              overallStatus: 'В процессе',
              totalLessons: 4,
              completedLessons: 3,
              inProgressLessons: 1,
              notStartedLessons: 0,
            }
          })
        })
      };

      mockContainer.get.mockReturnValue(mockUseCase);

      const request = new NextRequest('http://localhost:3000/api/courses/course-1/progress', {
        method: 'PUT',
        body: JSON.stringify({
          lessonId: 'lesson-1',
          status: 'completed'
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const params = { id: 'course-1' };

      // Act
      const response = await PUT(request, { params });

      // Assert
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.message).toBe('Lesson progress updated successfully');
      expect(mockUseCase.execute).toHaveBeenCalledWith({
        courseId: 'course-1',
        lessonId: 'lesson-1',
        userId: 'user-1',
        status: 'completed',
      });
    });

    it('should return 401 when user is not authenticated', async () => {
      // Arrange
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/courses/course-1/progress', {
        method: 'PUT',
        body: JSON.stringify({
          lessonId: 'lesson-1',
          status: 'completed'
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const params = { id: 'course-1' };

      // Act
      const response = await PUT(request, { params });

      // Assert
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 400 when lesson ID is missing', async () => {
      // Arrange
      const mockSession = {
        user: { id: 'user-1', name: 'Test User', email: 'test@example.com' }
      };
      mockGetServerSession.mockResolvedValue(mockSession as any);

      const request = new NextRequest('http://localhost:3000/api/courses/course-1/progress', {
        method: 'PUT',
        body: JSON.stringify({
          status: 'completed'
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const params = { id: 'course-1' };

      // Act
      const response = await PUT(request, { params });

      // Assert
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Lesson ID and status are required');
    });

    it('should return 400 when status is invalid', async () => {
      // Arrange
      const mockSession = {
        user: { id: 'user-1', name: 'Test User', email: 'test@example.com' }
      };
      mockGetServerSession.mockResolvedValue(mockSession as any);

      const request = new NextRequest('http://localhost:3000/api/courses/course-1/progress', {
        method: 'PUT',
        body: JSON.stringify({
          lessonId: 'lesson-1',
          status: 'invalid'
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const params = { id: 'course-1' };

      // Act
      const response = await PUT(request, { params });

      // Assert
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Invalid status. Must be not_started, in_progress, or completed');
    });

    it('should return 400 when use case fails', async () => {
      // Arrange
      const mockSession = {
        user: { id: 'user-1', name: 'Test User', email: 'test@example.com' }
      };
      mockGetServerSession.mockResolvedValue(mockSession as any);

      const mockUseCase = {
        execute: jest.fn().mockResolvedValue({
          isSuccess: false,
          getError: () => new Error('Lesson not found')
        })
      };

      mockContainer.get.mockReturnValue(mockUseCase);

      const request = new NextRequest('http://localhost:3000/api/courses/course-1/progress', {
        method: 'PUT',
        body: JSON.stringify({
          lessonId: 'lesson-1',
          status: 'completed'
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const params = { id: 'course-1' };

      // Act
      const response = await PUT(request, { params });

      // Assert
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Lesson not found');
    });
  });
});