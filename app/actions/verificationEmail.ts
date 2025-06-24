"use server";
import { getTokenByToken } from "@/lib/tokens";
import { prisma } from "@/lib/prisma"; // Aggiungi la connessione al database

export const verificationEmail = async (
  token: string
): Promise<{
  success: boolean;
  errors?: { [key: string]: { _errors: string[] } } | undefined;
}> => {
  try {
    // 1.  Ceck if the token exists
    const existingToken = await getTokenByToken(token);
    console.log(token);

    if (!existingToken) {
      return {
        success: false,
        errors: {
          token: {
            _errors: ["Token not found"],
          },
        },
      };
    }

    // 2. Ceck if the token is expired
    const now = new Date();
    if (existingToken.expiresAt < now) {
      return {
        success: false,
        errors: {
          token: {
            _errors: ["Token has expired"],
          },
        },
      };
    }

    // 3. Verify the user exists
    const user = await prisma.user.findUnique({
      where: {
        email: existingToken.email, // Usa l'email per cercare l'utente
      },
    });

    if (!user) {
      return {
        success: false,
        errors: {
          user: {
            _errors: ["User not found"],
          },
        },
      };
    }

    // 4. Update the user to set emailVerified
    await prisma.user.update({
      where: { email: existingToken.email },
      data: { emailVerified: new Date() },
    });

    // 5. Remove the token from the database
    await prisma.token.delete({
      where: { id: existingToken.id }, // Usa l'ID per eliminare il token
    });

    // 6. If everithing is ok, return success
    return {
      success: true,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      errors: {
        general: {
          _errors: ["An unexpected error occurred"],
        },
      },
    };
  }
};
