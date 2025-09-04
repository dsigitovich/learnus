"use client";

import { useSession } from "next-auth/react";
import { useStore } from "@/lib/store";
import { useEffect } from "react";

export function useAuth() {
  const { data: session, status } = useSession();
  const { user, setUser, setAuthLoading, isAuthenticated, isLoading } = useStore();

  useEffect(() => {
    setAuthLoading(status === "loading");

    if (status === "authenticated" && session?.user) {
      // Синхронизируем данные из сессии с store
      const userData = {
        id: (session.user as any).id || "",
        googleId: "", // Будет заполнен из БД
        email: session.user.email || "",
        name: session.user.name || "",
        avatarUrl: session.user.image || undefined,
        level: (session.user as any).level || "Beginner",
        interests: (session.user as any).interests || [],
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      if (!user || user.email !== userData.email) {
        setUser(userData);
      }
    } else if (status === "unauthenticated") {
      setUser(null);
    }
  }, [session, status, setUser, setAuthLoading, user]);

  return {
    user,
    isAuthenticated,
    isLoading,
    session,
  };
}