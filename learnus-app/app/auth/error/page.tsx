'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

const errors: Record<string, string> = {
  Configuration: 'Ошибка конфигурации сервера. Пожалуйста, свяжитесь с администратором.',
  AccessDenied: 'Доступ запрещен. У вас нет разрешения на вход.',
  Verification: 'Ссылка для входа недействительна или истекла.',
  OAuthSignin: 'Ошибка при построении URL авторизации.',
  OAuthCallback: 'Ошибка при обработке ответа от Google.',
  OAuthCreateAccount: 'Не удалось создать аккаунт пользователя.',
  EmailCreateAccount: 'Не удалось создать аккаунт пользователя.',
  Callback: 'Ошибка при обработке callback URL.',
  OAuthAccountNotLinked: 'Этот email уже используется другим аккаунтом.',
  EmailSignin: 'Не удалось отправить email для входа.',
  CredentialsSignin: 'Ошибка входа. Проверьте введенные данные.',
  SessionRequired: 'Пожалуйста, войдите для доступа к этой странице.',
  Default: 'Произошла неизвестная ошибка при авторизации.',
};

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const errorMessage = error ? errors[error] || errors.Default : errors.Default;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 py-8 px-6 shadow-lg rounded-lg">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20">
              <svg
                className="h-6 w-6 text-red-600 dark:text-red-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
              Ошибка авторизации
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {errorMessage}
            </p>
            {error && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                Код ошибки: {error}
              </p>
            )}
          </div>

          <div className="mt-6 space-y-3">
            <Link
              href="/auth/signin"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Попробовать снова
            </Link>
            <Link
              href="/"
              className="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              На главную
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}