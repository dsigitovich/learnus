import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Дополнительная логика middleware при необходимости
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        // Пути, которые требуют аутентификации
        const protectedPaths = ["/profile", "/settings", "/courses/create"];
        const pathname = req.nextUrl.pathname;
        
        // Проверяем, является ли путь защищенным
        const isProtected = protectedPaths.some(path => pathname.startsWith(path));
        
        // Если путь защищен, проверяем наличие токена
        if (isProtected) {
          return !!token;
        }
        
        // Для остальных путей разрешаем доступ
        return true;
      },
    },
    pages: {
      signIn: "/auth/signin",
      error: "/auth/error",
    },
  }
);

export const config = {
  matcher: [
    // Защищаем определенные маршруты
    "/profile/:path*",
    "/settings/:path*",
    "/courses/create/:path*",
  ],
};