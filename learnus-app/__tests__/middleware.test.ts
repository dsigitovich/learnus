import { NextRequest, NextResponse } from 'next/server';
import middleware from '../middleware';

// Мокаем withAuth
jest.mock('next-auth/middleware', () => ({
  withAuth: jest.fn((middlewareFunc, options) => {
    return (req: any) => {
      // Эмулируем поведение withAuth
      const authorized = options.callbacks.authorized({ 
        token: req.nextauth?.token, 
        req 
      });
      
      if (!authorized && !req.nextUrl.pathname.includes('/auth/signin')) {
        return NextResponse.redirect(new URL(options.pages.signIn, req.url));
      }
      
      return middlewareFunc(req);
    };
  }),
}));

describe('Middleware', () => {
  const createMockRequest = (pathname: string, token?: any) => {
    const url = new URL(`http://localhost:3000${pathname}`);
    const req = {
      nextUrl: url,
      url: url.toString(),
      nextauth: token ? { token } : undefined,
    } as any;
    return req;
  };

  it('должен перенаправлять авторизованных пользователей с /auth/signin на главную', () => {
    const req = createMockRequest('/auth/signin', { user: { id: '123' } });
    const response = middleware(req);
    
    expect(response).toBeInstanceOf(NextResponse);
    expect(response.status).toBe(307); // Redirect status
    expect(response.headers.get('location')).toBe('http://localhost:3000/');
  });

  it('должен разрешать неавторизованным пользователям доступ к /auth/signin', () => {
    const req = createMockRequest('/auth/signin');
    const response = middleware(req);
    
    expect(response).toEqual(NextResponse.next());
  });

  it('должен перенаправлять неавторизованных пользователей на страницу входа для защищенных маршрутов', () => {
    const req = createMockRequest('/api/courses');
    const response = middleware(req);
    
    expect(response).toBeInstanceOf(NextResponse);
    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('http://localhost:3000/auth/signin');
  });

  it('должен разрешать авторизованным пользователям доступ к защищенным маршрутам', () => {
    const req = createMockRequest('/api/courses', { user: { id: '123' } });
    const response = middleware(req);
    
    expect(response).toEqual(NextResponse.next());
  });

  it('должен правильно обрабатывать matcher конфигурацию', () => {
    const config = require('../middleware').config;
    
    expect(config.matcher).toContain('/api/courses/:path*');
    expect(config.matcher).toContain('/api/chat/:path*');
    expect(config.matcher).toContain('/api/auth/profile/:path*');
    expect(config.matcher).toContain('/api/auth/me/:path*');
    expect(config.matcher).toContain('/profile/:path*');
    expect(config.matcher).toContain('/settings/:path*');
    expect(config.matcher).toContain('/courses/create/:path*');
  });
});