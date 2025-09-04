import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      level?: string
      interests?: string[]
    }
  }

  interface User {
    id: string
    level?: string
    interests?: string[]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    provider?: string
  }
}
