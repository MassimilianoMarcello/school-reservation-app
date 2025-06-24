import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/zodSchemas";
import { findUserByEmail } from "@/lib/prismaActions";
import { handleGoogleSignIn } from "@/lib/auth/google";
import { NextAuthConfig } from "next-auth";

const config: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Google({
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    CredentialsProvider({
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const user = await findUserByEmail(email);
        if (!user || !user.password || !user.emailVerified || !user.email) return null;

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          username: user.username ?? undefined,
          role: user.role ?? "USER",
          isTwoFactorEnabled: user.isTwoFactorEnabled ?? false,
          twoFactorPass: user.twoFactorPass ?? false,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        return await handleGoogleSignIn({ user, account, profile });
      }
      return true;
    },

    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
             token.username = user.username; 
        token.role = user.role ?? "USER";
        token.isOAuthUser = account?.provider !== "credentials";
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id;
        session.user.email = token.email;
          session.user.username = token.username; 
        session.user.role = token.role;
        session.user.isOAuthUser = token.isOAuthUser;
      }
      return session;
    },
  },
};

export default config;









