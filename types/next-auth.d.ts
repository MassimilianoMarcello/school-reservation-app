// types/next-auth.d.ts
import { DefaultSession, DefaultUser } from "next-auth"
import { Role } from "@prisma/client"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: Role
      username?: string
      isOAuthUser?: boolean
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    role: Role
    username?: string
    isTwoFactorEnabled?: boolean
    twoFactorPass?: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: Role
    username?: string
    isOAuthUser?: boolean
  }
}