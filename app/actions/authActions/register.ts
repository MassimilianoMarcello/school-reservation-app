"use server";

import { Role } from "@prisma/client";
import { userSchema, UserSchemaTypes } from "@/lib/zodSchemas";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { TokenType } from "@prisma/client";
import { generateToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/mails";

export async function registerUser(data: UserSchemaTypes) {
  const isValid = userSchema.safeParse(data);
  if (!isValid.success) {
    return {
      success: false,
      errors: isValid.error.format(),
    };
  }
  const { username, email, password } = data;

  const existingUser = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });
  if (existingUser) {
    return {
      success: false,
      errors: {
        email: {
          _errors: ["Email already exists"],
        },
      },
    };
  }
  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await prisma.user.create({
    data: {
      username, // Ensure this matches the updated Prisma schema
      email,
      password: hashedPassword,
      role: Role.USER,
    },
  });
  if (!newUser) {
    return {
      success: false,
      errors: {
        general: {
          _errors: ["Failed to create user"],
        },
      },
    };
  }
  if (!newUser.email) {
    return {
      success: false,
      errors: {
        general: { _errors: ["User email is missing"] },
      },
    };
  }

  const token = await generateToken(
    newUser.email,
    TokenType.EMAIL_VERIFICATION
  );
  await sendVerificationEmail(token.token, newUser.email);

  return {
    success: true,
    user: newUser,
  };
}
