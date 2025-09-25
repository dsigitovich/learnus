import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChatTab from '../ChatTab';

// Mock fetch
global.fetch = jest.fn();

describe('ChatTab', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  it('should render chat interface', () => {
    render(
      <ChatTab
        courseId="course-1"
        courseTitle="React Basics"
      />
    );

    expect(screen.getByText('Чат с ИИ-помощником')).toBeInTheDocument();
    expect(screen.getByText('Курс: React Basics')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Задайте вопрос по курсу...')).toBeInTheDocument();
    expect(screen.getByText('Отправить')).toBeInTheDocument();
  });

  it('should show empty state when no messages', () => {
    render(
      <ChatTab
        courseId="course-1"
        courseTitle="React Basics"
      />
    );

    expect(screen.getByText('Начните общение с ИИ-помощником')).toBeInTheDocument();
    expect(screen.getByText('Задавайте вопросы по курсу, просите объяснения или советы по изучению материала.')).toBeInTheDocument();
  });

  it('should send message when form is submitted', async () => {
    const mockResponse = {
      success: true,
      response: 'Это отличный вопрос! React - это библиотека для создания пользовательских интерфейсов.',
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      json: () => Promise.resolve(mockResponse),
    });

    render(
      <ChatTab
        courseId="course-1"
        courseTitle="React Basics"
      />
    );

    const input = screen.getByPlaceholderText('Задайте вопрос по курсу...');
    const sendButton = screen.getByText('Отправить');

    fireEvent.change(input, { target: { value: 'Что такое React?' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/courses/course-1/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'Что такое React?',
          lessonId: undefined,
        }),
      });
    });
  });

  it('should not send empty message', () => {
    render(
      <ChatTab
        courseId="course-1"
        courseTitle="React Basics"
      />
    );

    const sendButton = screen.getByText('Отправить');
    expect(sendButton).toBeDisabled();
  });

  it('should not send message when loading', async () => {
    const mockResponse = {
      success: true,
      response: 'Ответ ИИ',
    };

    (fetch as jest.Mock).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({
        json: () => Promise.resolve(mockResponse),
      }), 100))
    );

    render(
      <ChatTab
        courseId="course-1"
        courseTitle="React Basics"
      />
    );

    const input = screen.getByPlaceholderText('Задайте вопрос по курсу...');
    const sendButton = screen.getByText('Отправить');

    fireEvent.change(input, { target: { value: 'Тест' } });
    fireEvent.click(sendButton);

    // Button should be disabled while loading
    await waitFor(() => {
      expect(sendButton).toBeDisabled();
    });
  });

  it('should handle API error gracefully', async () => {
    const mockResponse = {
      success: false,
      error: 'API Error',
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      json: () => Promise.resolve(mockResponse),
    });

    render(
      <ChatTab
        courseId="course-1"
        courseTitle="React Basics"
      />
    );

    const input = screen.getByPlaceholderText('Задайте вопрос по курсу...');
    const sendButton = screen.getByText('Отправить');

    fireEvent.change(input, { target: { value: 'Тест' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText('Извините, произошла ошибка. Попробуйте еще раз.')).toBeInTheDocument();
    });
  });

  it('should handle network error gracefully', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(
      <ChatTab
        courseId="course-1"
        courseTitle="React Basics"
      />
    );

    const input = screen.getByPlaceholderText('Задайте вопрос по курсу...');
    const sendButton = screen.getByText('Отправить');

    fireEvent.change(input, { target: { value: 'Тест' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText('Извините, произошла ошибка. Попробуйте еще раз.')).toBeInTheDocument();
    });
  });

  it('should display user and AI messages correctly', async () => {
    const mockResponse = {
      success: true,
      response: 'Это отличный вопрос!',
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      json: () => Promise.resolve(mockResponse),
    });

    render(
      <ChatTab
        courseId="course-1"
        courseTitle="React Basics"
      />
    );

    const input = screen.getByPlaceholderText('Задайте вопрос по курсу...');
    const sendButton = screen.getByText('Отправить');

    fireEvent.change(input, { target: { value: 'Что такое React?' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText('Что такое React?')).toBeInTheDocument();
      expect(screen.getByText('Это отличный вопрос!')).toBeInTheDocument();
    });
  });

  it('should show loading indicator while waiting for response', async () => {
    (fetch as jest.Mock).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({
        json: () => Promise.resolve({ success: true, response: 'Ответ' }),
      }), 100))
    );

    render(
      <ChatTab
        courseId="course-1"
        courseTitle="React Basics"
      />
    );

    const input = screen.getByPlaceholderText('Задайте вопрос по курсу...');
    const sendButton = screen.getByText('Отправить');

    fireEvent.change(input, { target: { value: 'Тест' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText('Отправить')).toBeDisabled();
    });
  });

  it('should format timestamps correctly', async () => {
    const mockResponse = {
      success: true,
      response: 'Ответ',
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      json: () => Promise.resolve(mockResponse),
    });

    render(
      <ChatTab
        courseId="course-1"
        courseTitle="React Basics"
      />
    );

    const input = screen.getByPlaceholderText('Задайте вопрос по курсу...');
    const sendButton = screen.getByText('Отправить');

    fireEvent.change(input, { target: { value: 'Тест' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      // Check that timestamps are displayed (they should be formatted as time)
      const timestamps = screen.getAllByText(/\d{2}:\d{2}/);
      expect(timestamps.length).toBeGreaterThan(0);
    });
  });
});