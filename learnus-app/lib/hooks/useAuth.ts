'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useStore } from '../store';

export function useAuth() {
  const { data: session, status } = useSession();
  const { user, setUser, setLoading, fetchUser } = useStore();

  useEffect(() => {
    if (status === 'loading') {
      setLoading(true);
      return;
    }

    if (status === 'authenticated' && session?.user) {
      // Если есть сессия, но нет пользователя в store, загружаем его
      if (!user) {
        fetchUser();
      }
    } else if (status === 'unauthenticated') {
      // Если нет сессии, очищаем пользователя
      setUser(null);
      setLoading(false);
    }
  }, [status, session, user, setUser, setLoading, fetchUser]);

  return {
    user: useStore((state) => state.user),
    isAuthenticated: useStore((state) => state.isAuthenticated),
    isLoading: useStore((state) => state.isLoading),
    updateUser: useStore((state) => state.updateUser),
    logout: useStore((state) => state.logout),
  };
}