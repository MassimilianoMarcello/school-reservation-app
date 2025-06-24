// lib/prisma/user.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const findUserByEmail = async (email: string) => {
  return await prisma.user.findUnique({
    where: { email },
  });
};

export async function markEmailAsVerified(email: string) {
  try {
    await prisma.user.update({
      where: { email },
      data: { emailVerified: new Date() }, // Auth.js si aspetta una data
    });
  } catch (error) {
    console.error("Failed to mark email as verified:", error);
    throw new Error("Email verification failed");
  }
}




export async function getUserFromDbByEmail(email: string) {
  return await prisma.user.findUnique({
    where: { email },
    select: {
      role: true,
      isTwoFactorEnabled: true,
      twoFactorPass: true,
    },
  });
}

