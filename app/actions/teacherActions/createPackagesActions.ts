// lib/actions/package-actions.ts
"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { lessonPackageSchema } from "@/lib/zodSchemas";
import { revalidatePath } from "next/cache";
import * as z from "zod";

// Schema esteso per includere teacherId
const createPackageSchema = lessonPackageSchema.extend({
  teacherId: z.string().min(1),
});

type CreatePackageInput = z.infer<typeof createPackageSchema>;

export async function createLessonPackage(data: CreatePackageInput) {
  try {
    // Verifica l'autenticazione
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Non autenticato" };
    }

    // Verifica che l'utente sia un teacher e che stia creando un pacchetto per se stesso
    if (session.user.role !== "TEACHER" || session.user.id !== data.teacherId) {
      return { success: false, error: "Non autorizzato" };
    }

    // Valida i dati
    const validatedData = createPackageSchema.parse(data);

    // Verifica che l'insegnante esista
    const teacher = await prisma.user.findUnique({
      where: { 
        id: validatedData.teacherId,
        role: "TEACHER"
      },
    });

    if (!teacher) {
      return { success: false, error: "Insegnante non trovato" };
    }

    // Crea il pacchetto
    const lessonPackage = await prisma.lessonPackage.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        lessonCount: validatedData.lessonCount,
        duration: validatedData.duration,
        price: validatedData.price,
        teacherId: validatedData.teacherId,
      },
    });

    // Revalida la cache della pagina
    revalidatePath("/teacher/packages");
    revalidatePath("/teacher/dashboard");

    // Converti il Decimal in number per il client
    const serializedPackage = {
      ...lessonPackage,
      price: lessonPackage.price.toNumber(), // Converte Decimal in number
      createdAt: lessonPackage.createdAt.toISOString(), // Converte Date in string
      updatedAt: lessonPackage.updatedAt.toISOString(), // Converte Date in string
    };

    return { 
      success: true, 
      data: serializedPackage 
    };

  } catch (error) {
    console.error("Errore nella creazione del pacchetto:", error);
    
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: "Dati non validi: " + error.errors.map(e => e.message).join(", ")
      };
    }

    return { 
      success: false, 
      error: "Errore interno del server" 
    };
  }
}

// Funzione per ottenere i pacchetti di un insegnante
export async function getTeacherPackages(teacherId?: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Non autenticato" };
    }

    // Se non è specificato teacherId, usa quello della sessione
    const targetTeacherId = teacherId || session.user.id;

    // Verifica autorizzazioni
    if (session.user.role !== "TEACHER" && session.user.role !== "ADMIN") {
      return { success: false, error: "Non autorizzato" };
    }

    if (session.user.role === "TEACHER" && session.user.id !== targetTeacherId) {
      return { success: false, error: "Non autorizzato" };
    }

    const packages = await prisma.lessonPackage.findMany({
      where: { teacherId: targetTeacherId },
      orderBy: { createdAt: "desc" },
      include: {
        teacher: {
          select: {
            username: true,
            email: true,
          },
        },
        _count: {
          select: {
            purchases: true,
          },
        },
      },
    });

    // Serializza i dati per il client
    const serializedPackages = packages.map(pkg => ({
      ...pkg,
      price: pkg.price.toNumber(), // Converte Decimal in number
      createdAt: pkg.createdAt.toISOString(), // Converte Date in string
      updatedAt: pkg.updatedAt.toISOString(), // Converte Date in string
    }));

    return { success: true, data: serializedPackages };

  } catch (error) {
    console.error("Errore nel recupero dei pacchetti:", error);
    return { success: false, error: "Errore interno del server" };
  }
}