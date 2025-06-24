"use server";

import * as z from "zod";

import { prisma } from "@/lib/prisma";

import { loginSchema } from "@/lib/zodSchemas";
import { generateToken, getTokenByEmail } from "@/lib/tokens";
import { TokenType } from "@prisma/client";

import { sendVerificationEmail } from "@/lib/mails";

export const login = async (values: z.infer<typeof loginSchema>) => {
  const validatedFields = loginSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { email } = validatedFields.data;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (!existingUser || !existingUser.password) {
    return { error: "Email does not exist!" };
  }

  if (!existingUser.emailVerified) {
    if (!existingUser.email) {
      return { error: "Email is invalid." };
    }
    const existingToken = await getTokenByEmail(existingUser.email);
    if (existingToken && existingToken.expiresAt > new Date()) {
      return {
        error:
          "Please verify your email. We've already sent you an email recently.",
      };
    }

    const token = await generateToken(
      existingUser.email,
      TokenType.EMAIL_VERIFICATION
    );
    await sendVerificationEmail(token.token, existingUser.email);
    return { error: "Please verify your email before logging in." };
  }

  return { success: true };
};
