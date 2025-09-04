import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Пути, которые требуют аутентификации
  const protectedPaths = ["/profile", "/settings", "/courses/create"];
  const pathname = request.nextUrl.pathname;
  
  // Проверяем, является ли путь защищенным
  const isProtected = protectedPaths.some(path => pathname.startsWith(path));
  
  if (isProtected) {
    // Проверяем наличие сессии через cookie
    const sessionToken = request.cookies.get('next-auth.session-token') || 
                        request.cookies.get('__Secure-next-auth.session-token');
    
    if (!sessionToken) {
      // Перенаправляем на страницу входа
      const signInUrl = new URL('/auth/signin', request.url);
      signInUrl.searchParams.set('callbackUrl', request.url);
      return NextResponse.redirect(signInUrl);
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Защищаем определенные маршруты
    "/profile/:path*",
    "/settings/:path*",
    "/courses/create/:path*",
  ],
};