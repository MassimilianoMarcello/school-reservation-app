"use server";

import { prisma } from "@/lib/prisma";
import { TokenType } from "@prisma/client";
import bcrypt from "bcryptjs";
import { getTokenByToken } from "@/lib/tokens";

export async function resetPassword(token: string, newPassword: string) {
  try {
    // 1.find the token in the database
    const existingToken = await getTokenByToken(token);

    if (!existingToken) {
      return {
        success: false,
        error: "Invalid or expired token.",
      };
    }

    // 2. Verify if the token is expired
    const currentTime = new Date();
    if (existingToken.expiresAt < currentTime) {
      return {
        success: false,
        error: "Token has expired.",
      };
    }

    // 3. Find the user associated with the token
    const user = await prisma.user.findUnique({
      where: {
        email: existingToken.email,
      },
    });

    if (!user) {
      return {
        success: false,
        error: "User not found.",
      };
    }

    // 4. Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 5. Update the user's password
    if (user.email) {
      await prisma.user.update({
        where: { email: user.email },
        data: { password: hashedPassword },
      });
    } else {
      return {
        success: false,
        error: "User email is invalid.",
      };
    }

    // 6. Remove the token from the database to prevent reuse
    await prisma.token.deleteMany({
      where: {
        email: user.email,
        type: TokenType.PASSWORD_RESET,
      },
    });

    return {
      success: true,
      message: "Password successfully reset.",
    };
  } catch (error) {
    console.error("Error resetting password:", error);
    return {
      success: false,
      error: "An error occurred while resetting the password.",
    };
  }
}