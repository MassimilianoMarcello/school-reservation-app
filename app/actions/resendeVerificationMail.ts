"use server";

import { prisma } from "@/lib/prisma";
import { TokenType } from "@prisma/client";
import { generateToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/mails";

export async function resendVerificationEmail(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !user.email) {
    return {
      success: false,
      error: "No user found with this email address.",
    };
  }

  // Check if the user is already verified
  if (user.emailVerified) {
    return {
      success: false,
      error: "This email address has already been verified.",
    };
  }

  const existingToken = await prisma.token.findFirst({
    where: {
      email,
      type: TokenType.EMAIL_VERIFICATION,
      expiresAt: { gt: new Date() }, // only if not expired
    },
  });

  const tokenToSend =
    existingToken?.token ??
    (await generateToken(user.email, TokenType.EMAIL_VERIFICATION)).token;

  await sendVerificationEmail(tokenToSend, user.email);

  return {
    success: true,
    message: "Verification email has been sent.",
  };
}
