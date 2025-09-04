import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    // Если пользователь авторизован и пытается зайти на страницу входа,
    // перенаправляем на главную
    if (req.nextauth.token && req.nextUrl.pathname === '/auth/signin') {
      return NextResponse.redirect(new URL('/', req.url));
    }
    
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Страница входа доступна всем
        if (req.nextUrl.pathname === '/auth/signin') {
          return true;
        }
        // Остальные защищенные маршруты требуют авторизации
        return !!token;
      },
    },
    pages: {
      signIn: '/auth/signin',
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
    // Страница входа (для перенаправления авторизованных пользователей)
    '/auth/signin',
  ],
};