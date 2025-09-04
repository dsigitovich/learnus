import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    // Дополнительная логика middleware при необходимости
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

// Конфигурация защищенных роутов
export const config = {
  matcher: [
    // API роуты, требующие аутентификации
    '/api/courses/:path*',
    '/api/chat/:path*',
    '/api/auth/profile/:path*',
    '/api/auth/me/:path*',
    // Страницы, требующие аутентификации
    '/profile/:path*',
    '/settings/:path*',
    '/courses/create/:path*',
  ],
};