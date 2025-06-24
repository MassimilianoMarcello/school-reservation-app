"use server";

import { prisma } from "@/lib/prisma";
import { TokenType } from "@prisma/client";
import { generateToken } from "@/lib/tokens";
import { sendResetPasswordEmail } from "@/lib/mails";

const TOKEN_COOLDOWN_MINUTES = 15;

export async function resetPassword(data: { email: string }) {
  const { email } = data;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !user.email) {
    return {
      success: false,
      error: "No user found with this email address.",
    };
  }

  // Look for an existing token for the user that is not expired
  const existingToken = await prisma.token.findFirst({
    where: {
      email,
      type: TokenType.PASSWORD_RESET,
      expiresAt: { gt: new Date() }, // token non ancora scaduto
    },
  });

  if (existingToken) {
    const now = new Date();
    const tokenExpiresAt = existingToken.expiresAt; // Usa expiresAt per il cooldown
    const tokenAgeInMs = now.getTime() - tokenExpiresAt.getTime(); // Confronta con expiresAt
    const tokenAgeInMinutes = tokenAgeInMs / 1000 / 60;

    if (tokenAgeInMinutes < TOKEN_COOLDOWN_MINUTES) {
      return {
        success: false,
        error: `Please check your inbox for the previous reset email. For security reasons, you must wait ${Math.ceil(TOKEN_COOLDOWN_MINUTES - tokenAgeInMinutes)} more minute(s) before requesting a new password reset email.`,
      };
    }
  }

  // If no valid token exists or the cooldown has passed, generate a new token
  const tokenToSend =
    existingToken?.token ??
    (await generateToken(user.email, TokenType.PASSWORD_RESET)).token;

  //  Send the reset password email
  await sendResetPasswordEmail(tokenToSend, user.email);

  return {
    success: true,
    message: "Reset password email has been sent.",
  };
}