import { render, screen, fireEvent } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import ProgressPage from '../ProgressPage';
import { useStore } from '@/lib/store';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock store
jest.mock('@/lib/store', () => ({
  useStore: jest.fn(),
}));

// Mock hooks
jest.mock('@/lib/hooks/useCourseProgress', () => ({
  useCourseProgress: jest.fn(),
}));

const mockPush = jest.fn();
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUseStore = useStore as jest.MockedFunction<typeof useStore>;

describe('ProgressPage', () => {
  beforeEach(() => {
    mockUseRouter.mockReturnValue({
      push: mockPush,
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    });

    mockUseStore.mockReturnValue({
      courses: [
        {
          id: '1',
          title: 'React Basics',
          description: 'Learn React fundamentals',
          level: 'Beginner',
          modules: [
            {
              title: 'Module 1',
              lessons: [
                { title: 'Lesson 1', content: 'Content 1' },
                { title: 'Lesson 2', content: 'Content 2' },
              ],
            },
          ],
        },
        {
          id: '2',
          title: 'Advanced React',
          description: 'Advanced React concepts',
          level: 'Advanced',
          modules: [
            {
              title: 'Module 1',
              lessons: [
                { title: 'Lesson 1', content: 'Content 1' },
              ],
            },
          ],
        },
      ],
      chats: [
        {
          id: 'chat1',
          type: 'course',
          courseId: '1',
          courseProgress: {
            currentModuleIndex: 0,
            currentLessonIndex: 1,
            progressPercentage: 50,
          },
        },
        {
          id: 'chat2',
          type: 'course',
          courseId: '2',
          courseProgress: {
            currentModuleIndex: 0,
            currentLessonIndex: 0,
            progressPercentage: 0,
          },
        },
      ],
      messages: [],
      currentChatId: null,
      currentCourseId: null,
      addMessage: jest.fn(),
      selectChat: jest.fn(),
      selectCourse: jest.fn(),
      createCourse: jest.fn(),
      deleteChat: jest.fn(),
      deleteCourse: jest.fn(),
      createCourseChat: jest.fn(),
      createGeneralChat: jest.fn(),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render progress page with statistics', () => {
    render(<ProgressPage />);

    expect(screen.getByText('Мой прогресс')).toBeInTheDocument();
    expect(screen.getByText('Отслеживайте свой прогресс обучения')).toBeInTheDocument();
    expect(screen.getByText('Всего курсов')).toBeInTheDocument();
    expect(screen.getByText('Завершено')).toBeInTheDocument();
    expect(screen.getByText('В процессе')).toBeInTheDocument();
    expect(screen.getByText('Общий прогресс')).toBeInTheDocument();
  });

  it('should display course statistics correctly', () => {
    render(<ProgressPage />);

    expect(screen.getByText('2')).toBeInTheDocument(); // Всего курсов
    expect(screen.getByText('0')).toBeInTheDocument(); // Завершено
    expect(screen.getByText('1')).toBeInTheDocument(); // В процессе
    expect(screen.getByText('25%')).toBeInTheDocument(); // Общий прогресс (50% + 0%) / 2
  });

  it('should render courses list', () => {
    render(<ProgressPage />);

    expect(screen.getByText('React Basics')).toBeInTheDocument();
    expect(screen.getByText('Advanced React')).toBeInTheDocument();
    expect(screen.getByText('Learn React fundamentals')).toBeInTheDocument();
    expect(screen.getByText('Advanced React concepts')).toBeInTheDocument();
  });

  it('should navigate to course when course is clicked', () => {
    render(<ProgressPage />);

    const courseCard = screen.getByText('React Basics').closest('div');
    fireEvent.click(courseCard!);

    expect(mockPush).toHaveBeenCalledWith('/courses/1');
  });

  it('should navigate back to chat when back button is clicked', () => {
    render(<ProgressPage />);

    const backButton = screen.getByTitle('Вернуться к чату');
    fireEvent.click(backButton);

    expect(mockPush).toHaveBeenCalledWith('/');
  });

  it('should show empty state when no courses', () => {
    mockUseStore.mockReturnValue({
      courses: [],
      chats: [],
      messages: [],
      currentChatId: null,
      currentCourseId: null,
      addMessage: jest.fn(),
      selectChat: jest.fn(),
      selectCourse: jest.fn(),
      createCourse: jest.fn(),
      deleteChat: jest.fn(),
      deleteCourse: jest.fn(),
      createCourseChat: jest.fn(),
      createGeneralChat: jest.fn(),
    });

    render(<ProgressPage />);

    expect(screen.getByText('Пока нет курсов')).toBeInTheDocument();
    expect(screen.getByText('Создайте свой первый курс, написав в чате "создай курс по..."')).toBeInTheDocument();
  });

  it('should display course progress correctly', () => {
    render(<ProgressPage />);

    // Проверяем прогресс для первого курса (50%)
    expect(screen.getByText('50%')).toBeInTheDocument();
    
    // Проверяем статус "В процессе изучения" для первого курса
    expect(screen.getByText('В процессе изучения')).toBeInTheDocument();
    
    // Проверяем статус "Не начат" для второго курса
    expect(screen.getByText('Не начат')).toBeInTheDocument();
  });

  it('should show completed course status', () => {
    mockUseStore.mockReturnValue({
      courses: [
        {
          id: '1',
          title: 'Completed Course',
          description: 'A completed course',
          level: 'Beginner',
          modules: [],
        },
      ],
      chats: [
        {
          id: 'chat1',
          type: 'course',
          courseId: '1',
          courseProgress: {
            currentModuleIndex: 0,
            currentLessonIndex: 0,
            progressPercentage: 100,
          },
        },
      ],
      messages: [],
      currentChatId: null,
      currentCourseId: null,
      addMessage: jest.fn(),
      selectChat: jest.fn(),
      selectCourse: jest.fn(),
      createCourse: jest.fn(),
      deleteChat: jest.fn(),
      deleteCourse: jest.fn(),
      createCourseChat: jest.fn(),
      createGeneralChat: jest.fn(),
    });

    render(<ProgressPage />);

    expect(screen.getByText('Курс завершен!')).toBeInTheDocument();
    expect(screen.getAllByText('100%')).toHaveLength(2); // Один в статистике, один в прогрессе курса
  });
});
