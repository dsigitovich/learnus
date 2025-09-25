import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProgressTab from '../ProgressTab';
import { useStore } from '@/lib/store';

// Mock Zustand store
jest.mock('@/lib/store');
const mockUseStore = useStore as jest.MockedFunction<typeof useStore>;

describe('ProgressTab', () => {
  const mockLessons = [
    {
      id: 'lesson-1',
      title: 'Введение в React',
      type: 'theory' as const,
      content: 'Основы React',
    },
    {
      id: 'lesson-2',
      title: 'Создание компонентов',
      type: 'exercise' as const,
      content: 'Практическое задание',
    },
  ];

  const mockCourseProgress = {
    id: 'progress-1',
    courseId: 'course-1',
    userId: 'user-1',
    completionPercentage: 50,
    overallStatus: 'В процессе',
    totalLessons: 2,
    completedLessons: 1,
    inProgressLessons: 1,
    notStartedLessons: 0,
    lessonProgresses: [
      {
        id: 'lp-1',
        lessonId: 'lesson-1',
        status: 'completed',
        startedAt: '2024-01-01T10:00:00Z',
        completedAt: '2024-01-01T11:00:00Z',
        durationInMinutes: 60,
      },
      {
        id: 'lp-2',
        lessonId: 'lesson-2',
        status: 'in_progress',
        startedAt: '2024-01-01T11:00:00Z',
      },
    ],
  };

  beforeEach(() => {
    mockUseStore.mockReturnValue({
      courseProgressData: { 'course-1': mockCourseProgress },
      fetchCourseProgress: jest.fn(),
      updateLessonProgress: jest.fn(),
    } as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render course progress overview', () => {
    render(
      <ProgressTab
        courseId="course-1"
        courseTitle="React Basics"
        lessons={mockLessons}
      />
    );

    expect(screen.getByText('Прогресс курса')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(screen.getByText('Завершено')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('Завершено уроков')).toBeInTheDocument();
  });

  it('should render lessons list with correct statuses', () => {
    render(
      <ProgressTab
        courseId="course-1"
        courseTitle="React Basics"
        lessons={mockLessons}
      />
    );

    expect(screen.getByText('1. Введение в React')).toBeInTheDocument();
    expect(screen.getByText('2. Создание компонентов')).toBeInTheDocument();
    expect(screen.getByText('Теория')).toBeInTheDocument();
    expect(screen.getByText('Практика')).toBeInTheDocument();
    expect(screen.getByText('Завершено')).toBeInTheDocument();
    expect(screen.getByText('В процессе')).toBeInTheDocument();
  });

  it('should call updateLessonProgress when button is clicked', async () => {
    const mockUpdateLessonProgress = jest.fn();
    mockUseStore.mockReturnValue({
      courseProgressData: { 'course-1': mockCourseProgress },
      fetchCourseProgress: jest.fn(),
      updateLessonProgress: mockUpdateLessonProgress,
    } as any);

    render(
      <ProgressTab
        courseId="course-1"
        courseTitle="React Basics"
        lessons={mockLessons}
      />
    );

    const completeButton = screen.getByText('Завершить');
    fireEvent.click(completeButton);

    await waitFor(() => {
      expect(mockUpdateLessonProgress).toHaveBeenCalledWith('course-1', 'lesson-2', 'completed');
    });
  });

  it('should show loading state', () => {
    mockUseStore.mockReturnValue({
      courseProgressData: {},
      fetchCourseProgress: jest.fn(),
      updateLessonProgress: jest.fn(),
    } as any);

    render(
      <ProgressTab
        courseId="course-1"
        courseTitle="React Basics"
        lessons={mockLessons}
      />
    );

    expect(screen.getByText('Загрузка курса...')).toBeInTheDocument();
  });

  it('should display duration information when available', () => {
    render(
      <ProgressTab
        courseId="course-1"
        courseTitle="React Basics"
        lessons={mockLessons}
      />
    );

    expect(screen.getByText('Общее время изучения:')).toBeInTheDocument();
  });

  it('should handle lesson progress updates correctly', async () => {
    const mockUpdateLessonProgress = jest.fn();
    mockUseStore.mockReturnValue({
      courseProgressData: { 'course-1': mockCourseProgress },
      fetchCourseProgress: jest.fn(),
      updateLessonProgress: mockUpdateLessonProgress,
    } as any);

    render(
      <ProgressTab
        courseId="course-1"
        courseTitle="React Basics"
        lessons={mockLessons}
      />
    );

    // Test starting a lesson
    const startButton = screen.getByText('Начать');
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(mockUpdateLessonProgress).toHaveBeenCalledWith('course-1', 'lesson-1', 'in_progress');
    });
  });

  it('should show correct status icons', () => {
    render(
      <ProgressTab
        courseId="course-1"
        courseTitle="React Basics"
        lessons={mockLessons}
      />
    );

    // Check that status icons are present (they are rendered as SVG elements)
    const statusIcons = screen.getAllByRole('img', { hidden: true });
    expect(statusIcons).toHaveLength(2); // One for each lesson
  });

  it('should handle empty course progress gracefully', () => {
    mockUseStore.mockReturnValue({
      courseProgressData: {},
      fetchCourseProgress: jest.fn(),
      updateLessonProgress: jest.fn(),
    } as any);

    render(
      <ProgressTab
        courseId="course-1"
        courseTitle="React Basics"
        lessons={mockLessons}
      />
    );

    expect(screen.getByText('Загрузка курса...')).toBeInTheDocument();
  });
});