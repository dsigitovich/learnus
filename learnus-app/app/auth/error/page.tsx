"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

const errors: Record<string, string> = {
  Configuration: "Проблема с конфигурацией сервера.",
  AccessDenied: "Доступ запрещен. У вас нет разрешения на вход.",
  Verification: "Срок действия ссылки для входа истек.",
  OAuthSignin: "Ошибка при построении URL авторизации.",
  OAuthCallback: "Ошибка при обработке ответа от OAuth провайдера.",
  OAuthCreateAccount: "Не удалось создать учетную запись OAuth.",
  EmailCreateAccount: "Не удалось создать учетную запись электронной почты.",
  Callback: "Ошибка в обработчике OAuth callback.",
  OAuthAccountNotLinked: "Чтобы подтвердить вашу личность, войдите с той же учетной записью, которую вы использовали изначально.",
  EmailSignin: "Проверьте свой адрес электронной почты.",
  CredentialsSignin: "Ошибка входа. Проверьте правильность введенных данных.",
  Default: "Произошла ошибка при входе в систему.",
};

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const errorMessage = error && errors[error] ? errors[error] : errors.Default;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900">
            <svg
              className="h-6 w-6 text-red-600 dark:text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
            Ошибка входа
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {errorMessage}
          </p>
        </div>

        <div className="mt-8 space-y-4">
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
            Вернуться на главную
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AuthError() {
  return (
    <Suspense fallback={<div>Загрузка...</div>}>
      <AuthErrorContent />
    </Suspense>
  );
}