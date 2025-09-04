import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { userRepository } from "../db/client";
import { v4 as uuidv4 } from "uuid";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          // Проверяем, существует ли пользователь
          const existingUser = userRepository.findByEmail(user.email!);
          
          if (!existingUser) {
            // Создаем нового пользователя
            userRepository.create({
              id: uuidv4(),
              googleId: profile?.sub!,
              email: user.email!,
              name: user.name!,
              avatarUrl: user.image || undefined,
              level: 'Beginner',
              interests: [],
              emailVerified: true
            });
          }
          
          return true;
        } catch (error) {
          console.error("Error during sign in:", error);
          return false;
        }
      }
      return true;
    },
    
    async session({ session }) {
      if (session.user?.email) {
        const dbUser = userRepository.findByEmail(session.user.email);
        if (dbUser) {
          session.user = {
            ...session.user,
            id: dbUser.id,
            level: dbUser.level,
            interests: dbUser.interests
          };
        }
      }
      return session;
    },
    
    async jwt({ token, user, account }) {
      if (account && user) {
        token.id = user.id;
        token.provider = account.provider;
      }
      return token;
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 дней
  },
  secret: process.env.NEXTAUTH_SECRET,
};