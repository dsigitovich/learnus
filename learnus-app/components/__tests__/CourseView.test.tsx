import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CourseView from '../CourseView';

// Mock Next.js router
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock fetch
global.fetch = jest.fn();

describe('CourseView', () => {
  const mockCourse = {
    id: 'course-1',
    title: 'React Basics',
    description: 'Изучаем основы React',
    level: 'Beginner',
    modules: [
      {
        id: 'module-1',
        title: 'Введение в React',
        learningObjectives: ['Понять основы React'],
        lessons: [
          {
            id: 'lesson-1',
            title: 'Что такое React',
            type: 'theory' as const,
            content: 'React - это библиотека для создания UI',
            promptsForUser: ['Расскажите о React'],
            expectedOutcome: 'Понимание основ React',
          },
          {
            id: 'lesson-2',
            title: 'Создание первого компонента',
            type: 'exercise' as const,
            content: 'Создайте простой компонент',
            promptsForUser: ['Создайте компонент'],
            expectedOutcome: 'Умение создавать компоненты',
          },
        ],
      },
    ],
  };

  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
    mockPush.mockClear();
  });

  it('should render loading state initially', () => {
    (fetch as jest.Mock).mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<CourseView courseId="course-1" />);

    expect(screen.getByText('Загрузка курса...')).toBeInTheDocument();
  });

  it('should render course information when loaded', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      json: () => Promise.resolve({ success: true, course: mockCourse }),
    });

    render(<CourseView courseId="course-1" />);

    await waitFor(() => {
      expect(screen.getByText('React Basics')).toBeInTheDocument();
      expect(screen.getByText('Изучаем основы React')).toBeInTheDocument();
      expect(screen.getByText('Начинающий')).toBeInTheDocument();
    });
  });

  it('should render tabs correctly', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      json: () => Promise.resolve({ success: true, course: mockCourse }),
    });

    render(<CourseView courseId="course-1" />);

    await waitFor(() => {
      expect(screen.getByText('Прогресс')).toBeInTheDocument();
      expect(screen.getByText('Чат с ИИ')).toBeInTheDocument();
    });
  });

  it('should switch between tabs', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      json: () => Promise.resolve({ success: true, course: mockCourse }),
    });

    render(<CourseView courseId="course-1" />);

    await waitFor(() => {
      expect(screen.getByText('React Basics')).toBeInTheDocument();
    });

    const chatTab = screen.getByText('Чат с ИИ');
    fireEvent.click(chatTab);

    // The chat tab should be active (we can't easily test the content without mocking the child components)
    expect(chatTab.closest('button')).toHaveClass('border-blue-500');
  });

  it('should handle back button click', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      json: () => Promise.resolve({ success: true, course: mockCourse }),
    });

    render(<CourseView courseId="course-1" />);

    await waitFor(() => {
      expect(screen.getByText('React Basics')).toBeInTheDocument();
    });

    const backButton = screen.getByRole('button', { name: /back/i });
    fireEvent.click(backButton);

    expect(mockPush).toHaveBeenCalledWith('/');
  });

  it('should handle course not found', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      json: () => Promise.resolve({ success: false, error: 'Course not found' }),
    });

    render(<CourseView courseId="course-1" />);

    await waitFor(() => {
      expect(screen.getByText('Курс не найден')).toBeInTheDocument();
      expect(screen.getByText('Вернуться на главную')).toBeInTheDocument();
    });
  });

  it('should handle fetch error', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(<CourseView courseId="course-1" />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  it('should display correct level badge', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      json: () => Promise.resolve({ success: true, course: mockCourse }),
    });

    render(<CourseView courseId="course-1" />);

    await waitFor(() => {
      const levelBadge = screen.getByText('Начинающий');
      expect(levelBadge).toHaveClass('bg-green-100', 'text-green-800');
    });
  });

  it('should display intermediate level badge correctly', async () => {
    const intermediateCourse = {
      ...mockCourse,
      level: 'Intermediate',
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      json: () => Promise.resolve({ success: true, course: intermediateCourse }),
    });

    render(<CourseView courseId="course-1" />);

    await waitFor(() => {
      const levelBadge = screen.getByText('Средний');
      expect(levelBadge).toHaveClass('bg-yellow-100', 'text-yellow-800');
    });
  });

  it('should display advanced level badge correctly', async () => {
    const advancedCourse = {
      ...mockCourse,
      level: 'Advanced',
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      json: () => Promise.resolve({ success: true, course: advancedCourse }),
    });

    render(<CourseView courseId="course-1" />);

    await waitFor(() => {
      const levelBadge = screen.getByText('Продвинутый');
      expect(levelBadge).toHaveClass('bg-red-100', 'text-red-800');
    });
  });

  it('should render progress tab by default', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      json: () => Promise.resolve({ success: true, course: mockCourse }),
    });

    render(<CourseView courseId="course-1" />);

    await waitFor(() => {
      const progressTab = screen.getByText('Прогресс');
      expect(progressTab.closest('button')).toHaveClass('border-blue-500');
    });
  });

  it('should handle tab switching correctly', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      json: () => Promise.resolve({ success: true, course: mockCourse }),
    });

    render(<CourseView courseId="course-1" />);

    await waitFor(() => {
      expect(screen.getByText('React Basics')).toBeInTheDocument();
    });

    const progressTab = screen.getByText('Прогресс');
    const chatTab = screen.getByText('Чат с ИИ');

    // Initially progress tab should be active
    expect(progressTab.closest('button')).toHaveClass('border-blue-500');

    // Click chat tab
    fireEvent.click(chatTab);

    // Now chat tab should be active
    expect(chatTab.closest('button')).toHaveClass('border-blue-500');
    expect(progressTab.closest('button')).not.toHaveClass('border-blue-500');
  });
});