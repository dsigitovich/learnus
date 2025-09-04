import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function SignInPage() {
  const session = await getServerSession(authOptions);
  
  // Если пользователь уже авторизован, перенаправляем на главную
  if (session) {
    redirect('/');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Socrademy
          </h1>
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">
            Добро пожаловать!
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Войдите, чтобы начать обучение
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 py-8 px-6 shadow-lg rounded-lg">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Вход в систему
              </h3>
              <GoogleSignInButton className="w-full" />
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">
                  Быстрый и безопасный вход
                </span>
              </div>
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
              <p>
                Нажимая &quot;Войти через Google&quot;, вы соглашаетесь с{' '}
                <a href="/terms" className="text-indigo-600 hover:text-indigo-500">
                  условиями использования
                </a>{' '}
                и{' '}
                <a href="/privacy" className="text-indigo-600 hover:text-indigo-500">
                  политикой конфиденциальности
                </a>
              </p>
            </div>
          </div>
        </div>

        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          <p>
            Новый пользователь? При первом входе ваш аккаунт будет создан автоматически
          </p>
        </div>
      </div>
    </div>
  );
}