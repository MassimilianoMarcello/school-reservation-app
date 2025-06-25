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



// Aggiungi queste funzioni al tuo file teacherActions/createPackagesActions.ts

// Schema per l'update (stesso del create ma con id)
const updatePackageSchema = lessonPackageSchema.extend({
  id: z.number(),
  teacherId: z.string().min(1),
});

type UpdatePackageInput = z.infer<typeof updatePackageSchema>;

// Funzione per ottenere un singolo pacchetto (per pre-popolare il form)
export async function getPackageById(packageId: number) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Non autenticato" };
    }

    if (session.user.role !== "TEACHER") {
      return { success: false, error: "Non autorizzato" };
    }

    const lessonPackage = await prisma.lessonPackage.findUnique({
      where: { 
        id: packageId,
        teacherId: session.user.id, // Solo i propri pacchetti
      },
    });

    if (!lessonPackage) {
      return { success: false, error: "Pacchetto non trovato" };
    }

    // Serializza per il client
    const serializedPackage = {
      ...lessonPackage,
      price: lessonPackage.price.toNumber(),
      createdAt: lessonPackage.createdAt.toISOString(),
      updatedAt: lessonPackage.updatedAt.toISOString(),
    };

    return { success: true, data: serializedPackage };

  } catch (error) {
    console.error("Errore nel recupero del pacchetto:", error);
    return { success: false, error: "Errore interno del server" };
  }
}

// Funzione per aggiornare il pacchetto
export async function updateLessonPackage(data: UpdatePackageInput) {
  try {
    // Verifica l'autenticazione
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Non autenticato" };
    }

    // Verifica che l'utente sia un teacher e che stia modificando un suo pacchetto
    if (session.user.role !== "TEACHER" || session.user.id !== data.teacherId) {
      return { success: false, error: "Non autorizzato" };
    }

    // Valida i dati
    const validatedData = updatePackageSchema.parse(data);

    // Verifica che il pacchetto esista e appartenga al teacher
    const existingPackage = await prisma.lessonPackage.findUnique({
      where: { id: validatedData.id },
      include: {
        _count: {
          select: {
            purchases: true,
          },
        },
      },
    });

    if (!existingPackage) {
      return { success: false, error: "Pacchetto non trovato" };
    }

    if (existingPackage.teacherId !== validatedData.teacherId) {
      return { success: false, error: "Non autorizzato a modificare questo pacchetto" };
    }

    // Controllo opzionale: se il pacchetto ha già acquisti, limita le modifiche
    if (existingPackage._count.purchases > 0) {
      // Potresti voler limitare le modifiche se ci sono già acquisti
      // Ad esempio, non permettere di cambiare lessonCount o duration
      // Ma per ora permettiamo tutto
    }

    // Aggiorna il pacchetto
    const updatedPackage = await prisma.lessonPackage.update({
      where: { id: validatedData.id },
      data: {
        name: validatedData.name,
        description: validatedData.description,
        lessonCount: validatedData.lessonCount,
        duration: validatedData.duration,
        price: validatedData.price,
        // Non aggiorniamo teacherId per sicurezza
      },
    });

    // Revalida la cache
    revalidatePath("/teacher/packages");
    revalidatePath(`/teacher/packages/${validatedData.id}`);
    revalidatePath("/teacher/dashboard");

    // Serializza per il client
    const serializedPackage = {
      ...updatedPackage,
      price: updatedPackage.price.toNumber(),
      createdAt: updatedPackage.createdAt.toISOString(),
      updatedAt: updatedPackage.updatedAt.toISOString(),
    };

    return { 
      success: true, 
      data: serializedPackage 
    };

  } catch (error) {
    console.error("Errore nell'aggiornamento del pacchetto:", error);
    
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