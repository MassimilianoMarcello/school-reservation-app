// this file handles Google sign-in logic for NextAuth.js with Prisma
// and ensures that users are created or updated in the database as needed.
//         session.user.isOAuthUser = token.isOAuthUser;


import type { User, Account, Profile } from "next-auth";
import { prisma } from "../prisma";
import { findUserByEmail } from "../prismaActions";

interface GoogleSignInParams {
  user: User;
  account: Account;
  profile?: Profile;
}

export async function handleGoogleSignIn({ user, account, profile }: GoogleSignInParams): Promise<boolean> {
  const email = user.email;
  if (!email) return false;

  const existingUser = await findUserByEmail(email);

  if (!existingUser) {
    const newUser = await prisma.user.create({
      data: {
        email,
        username: profile?.name ?? "Google User",
        emailVerified: new Date(),
      },
    });

    await prisma.account.create({
      data: {
        userId: newUser.id,
        provider: "google",
        providerAccountId: account.providerAccountId,
        access_token: account.access_token,
        refresh_token: account.refresh_token,
        expires_at: account.expires_at,
        type: "oauth",
      },
    });
  } else {
    const accountExists = await prisma.account.findFirst({
      where: {
        userId: existingUser.id,
        provider: "google",
      },
    });

    if (!accountExists) {
      await prisma.account.create({
        data: {
          userId: existingUser.id,
          provider: "google",
          providerAccountId: account.providerAccountId,
          access_token: account.access_token,
          refresh_token: account.refresh_token,
          expires_at: account.expires_at,
          type: "oauth",
        },
      });
    }
  }

  return true;
}

