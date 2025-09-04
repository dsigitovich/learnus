import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GoogleSignInButton } from '../GoogleSignInButton';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';

// Мокаем зависимости
jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
}));

describe('GoogleSignInButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('должна использовать callbackUrl по умолчанию "/"', async () => {
    const mockSearchParams = {
      get: jest.fn().mockReturnValue(null),
    };
    (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);

    render(<GoogleSignInButton />);
    
    const button = screen.getByRole('button', { name: /войти через google/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith('google', { callbackUrl: '/' });
    });
  });

  it('должна использовать переданный callbackUrl', async () => {
    const mockSearchParams = {
      get: jest.fn().mockReturnValue(null),
    };
    (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);

    render(<GoogleSignInButton callbackUrl="/dashboard" />);
    
    const button = screen.getByRole('button', { name: /войти через google/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith('google', { callbackUrl: '/dashboard' });
    });
  });

  it('должна использовать callbackUrl из URL параметров', async () => {
    const mockSearchParams = {
      get: jest.fn().mockReturnValue('/profile'),
    };
    (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);

    render(<GoogleSignInButton />);
    
    const button = screen.getByRole('button', { name: /войти через google/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith('google', { callbackUrl: '/profile' });
    });
  });

  it('должна показывать состояние загрузки при входе', async () => {
    const mockSearchParams = {
      get: jest.fn().mockReturnValue(null),
    };
    (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
    (signIn as jest.Mock).mockImplementation(() => new Promise(() => {})); // Не резолвится

    render(<GoogleSignInButton />);
    
    const button = screen.getByRole('button', { name: /войти через google/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Вход...')).toBeInTheDocument();
      expect(button).toBeDisabled();
    });
  });

  it('должна обрабатывать ошибки входа', async () => {
    const mockSearchParams = {
      get: jest.fn().mockReturnValue(null),
    };
    (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
    (signIn as jest.Mock).mockRejectedValue(new Error('Sign in failed'));
    
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    render(<GoogleSignInButton />);
    
    const button = screen.getByRole('button', { name: /войти через google/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Failed to sign in:', expect.any(Error));
      expect(button).not.toBeDisabled();
    });

    consoleSpy.mockRestore();
  });
});