// import NextAuth from "next-auth";
import { Role } from "@prisma/client"; // importa l'enum di Prisma

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
          email: string;
      username?: string;
      role?: Role;
      isTwoFactorEnabled: boolean;
      twoFactorPass?: boolean;
      isOAuthUser: boolean; // ✅ aggiunto
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    username?: string;
        email: string;
    role?: Role;
    isTwoFactorEnabled: boolean;
    twoFactorPass?: boolean;
 
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    username?: string;
    role?: Role;
    isTwoFactorEnabled: boolean;
    twoFactorPass?: boolean;
    isOAuthUser: boolean; // ✅ aggiunto
  }
}

