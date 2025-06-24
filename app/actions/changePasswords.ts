"use server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const changePassword = async (
  oldPassword: string,
  newPassword: string
) => {
  const session = await auth();

  if (!session) {
    return {
      success: false,
      error: "User not authenticated.",
    };
  }

  if (!session.user?.email) {
    return {
      success: false,
      error: "User email is missing.",
    };
  }

  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email,
    },
  });

  if (!user) {
    return {
      success: false,
      error: "User not found.",
    };
  }

  if (!user.password) {
    return {
      success: false,
      error: "User password is missing.",
    };
  }

  const isOldPasswordCorrect = await bcrypt.compare(oldPassword, user.password);
  if (!isOldPasswordCorrect) {
    return {
      success: false,
      error: "Old password is incorrect.",
    };
  }
  const hashedNewPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { email: session.user.email },
    data: { password: hashedNewPassword },
  });

  return {
    success: true,
    message: "Password updated successfully.",
  };
};