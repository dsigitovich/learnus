import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { type Adapter } from 'next-auth/adapters';
import Database from 'better-sqlite3';
import { randomUUID } from 'crypto';

// SQLite database instance
const db = new Database('./socrademy.db');

// Custom SQLite Adapter for NextAuth
function SQLiteAdapter(): Adapter {
  return {
    async createUser(user) {
      const id = randomUUID();
      const stmt = db.prepare(`
        INSERT INTO users (id, email, name, avatar_url, email_verified, google_id)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      
      stmt.run(
        id,
        user.email,
        user.name || '',
        user.image || null,
        user.emailVerified ? 1 : 0,
        user.email // Используем email как google_id временно
      );
      
      return {
        id,
        email: user.email!,
        name: user.name || '',
        image: user.image || null,
        emailVerified: user.emailVerified
      };
    },

    async getUser(id) {
      const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
      const user = stmt.get(id) as any;
      
      if (!user) return null;
      
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.avatar_url,
        emailVerified: user.email_verified === 1 ? new Date() : null
      };
    },

    async getUserByEmail(email) {
      const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
      const user = stmt.get(email) as any;
      
      if (!user) return null;
      
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.avatar_url,
        emailVerified: user.email_verified === 1 ? new Date() : null
      };
    },

    async getUserByAccount({ providerAccountId, provider }) {
      const stmt = db.prepare(`
        SELECT u.* FROM users u
        INNER JOIN accounts a ON u.id = a.userId
        WHERE a.provider = ? AND a.providerAccountId = ?
      `);
      const user = stmt.get(provider, providerAccountId) as any;
      
      if (!user) return null;
      
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.avatar_url,
        emailVerified: user.email_verified === 1 ? new Date() : null
      };
    },

    async updateUser(user) {
      const stmt = db.prepare(`
        UPDATE users 
        SET email = ?, name = ?, avatar_url = ?
        WHERE id = ?
      `);
      
      stmt.run(user.email, user.name, user.image, user.id);
      
      return {
        id: user.id!,
        email: user.email!,
        name: user.name || '',
        image: user.image || null,
        emailVerified: user.emailVerified
      };
    },

    async linkAccount(account) {
      const id = randomUUID();
      const stmt = db.prepare(`
        INSERT INTO accounts (
          id, userId, type, provider, providerAccountId,
          refresh_token, access_token, expires_at, token_type,
          scope, id_token, session_state
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      stmt.run(
        id,
        account.userId,
        account.type,
        account.provider,
        account.providerAccountId,
        account.refresh_token || null,
        account.access_token || null,
        account.expires_at || null,
        account.token_type || null,
        account.scope || null,
        account.id_token || null,
        account.session_state || null
      );
      
      // Обновляем google_id в таблице users
      const updateStmt = db.prepare('UPDATE users SET google_id = ? WHERE id = ?');
      updateStmt.run(account.providerAccountId, account.userId);
      
      return {
        id,
        userId: account.userId,
        type: account.type,
        provider: account.provider,
        providerAccountId: account.providerAccountId,
        refresh_token: account.refresh_token,
        access_token: account.access_token,
        expires_at: account.expires_at,
        token_type: account.token_type,
        scope: account.scope,
        id_token: account.id_token,
        session_state: account.session_state
      };
    },

    async createSession({ sessionToken, userId, expires }) {
      const id = randomUUID();
      const stmt = db.prepare(`
        INSERT INTO sessions (id, sessionToken, userId, expires)
        VALUES (?, ?, ?, ?)
      `);
      
      stmt.run(id, sessionToken, userId, expires.toISOString());
      
      return {
        sessionToken,
        userId,
        expires
      };
    },

    async getSessionAndUser(sessionToken) {
      const stmt = db.prepare(`
        SELECT 
          s.*, 
          u.id as user_id, u.email, u.name, u.avatar_url, u.email_verified
        FROM sessions s
        INNER JOIN users u ON s.userId = u.id
        WHERE s.sessionToken = ? AND s.expires > datetime('now')
      `);
      
      const result = stmt.get(sessionToken) as any;
      
      if (!result) return null;
      
      return {
        session: {
          sessionToken: result.sessionToken,
          userId: result.userId,
          expires: new Date(result.expires)
        },
        user: {
          id: result.user_id,
          email: result.email,
          name: result.name,
          image: result.avatar_url,
          emailVerified: result.email_verified === 1 ? new Date() : null
        }
      };
    },

    async updateSession({ sessionToken, expires }) {
      if (expires) {
        const stmt = db.prepare(`
          UPDATE sessions SET expires = ? WHERE sessionToken = ?
        `);
        stmt.run(expires.toISOString(), sessionToken);
      }
      
      const getStmt = db.prepare('SELECT * FROM sessions WHERE sessionToken = ?');
      const session = getStmt.get(sessionToken) as any;
      
      return {
        sessionToken: session.sessionToken,
        userId: session.userId,
        expires: new Date(session.expires)
      };
    },

    async deleteSession(sessionToken) {
      const stmt = db.prepare('DELETE FROM sessions WHERE sessionToken = ?');
      stmt.run(sessionToken);
    },

    async createVerificationToken({ identifier, token, expires }) {
      const stmt = db.prepare(`
        INSERT INTO verification_tokens (identifier, token, expires)
        VALUES (?, ?, ?)
      `);
      
      stmt.run(identifier, token, expires.toISOString());
      
      return {
        identifier,
        token,
        expires
      };
    },

    async useVerificationToken({ identifier, token }) {
      const stmt = db.prepare(`
        SELECT * FROM verification_tokens 
        WHERE identifier = ? AND token = ?
      `);
      
      const verificationToken = stmt.get(identifier, token) as any;
      
      if (!verificationToken) return null;
      
      const deleteStmt = db.prepare(`
        DELETE FROM verification_tokens 
        WHERE identifier = ? AND token = ?
      `);
      deleteStmt.run(identifier, token);
      
      return {
        identifier: verificationToken.identifier,
        token: verificationToken.token,
        expires: new Date(verificationToken.expires)
      };
    }
  };
}

export const authOptions: NextAuthOptions = {
  adapter: SQLiteAdapter(),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    })
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user && user) {
        session.user.id = user.id;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Если URL начинается с "/", это относительный путь
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      // Если URL на том же домене
      else if (new URL(url).origin === baseUrl) {
        return url;
      }
      // По умолчанию перенаправляем на главную страницу
      return baseUrl;
    },
    async signIn({ user, account, profile }) {
      return true;
    }
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  },
  session: {
    strategy: 'database',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};