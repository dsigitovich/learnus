import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { redirect } from "next/navigation";

export default async function SignInPage() {
  const session = await getServerSession(authOptions);
  
  if (session) {
    redirect("/");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Добро пожаловать в LearnUs
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Войдите, чтобы начать обучение
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">
                Продолжить с
              </span>
            </div>
          </div>

          <div className="flex justify-center">
            <GoogleSignInButton />
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          Входя в систему, вы соглашаетесь с нашими{" "}
          <a href="/terms" className="font-medium text-indigo-600 hover:text-indigo-500">
            Условиями использования
          </a>{" "}
          и{" "}
          <a href="/privacy" className="font-medium text-indigo-600 hover:text-indigo-500">
            Политикой конфиденциальности
          </a>
        </div>
      </div>
    </div>
  );
}