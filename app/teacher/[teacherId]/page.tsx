// app/teacher/[teacherId]/page.tsx
import { notFound } from "next/navigation";
import { auth } from "@/auth"; // Auth.js v5
import { prisma } from "@/lib/prisma"; // Il tuo client Prisma
import { TeacherPackagesClient } from "@/components/Teacher/teacherPackagesList";

interface PageProps {
  params: Promise<{
    teacherId: string;
  }>;
}

async function getTeacherWithPackages(teacherId: string) {
  try {
    const teacher = await prisma.user.findUnique({
      where: {
        id: teacherId,
      },
      include: {
        // Usa il nome del campo definito nel modello User per la relazione "TeacherPackages"
        packages: {
          where: {
            isActive: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            purchases: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    if (!teacher) {
      return null;
    }

    // Trasforma i dati per il client
    return {
      id: teacher.id,
      name: teacher.username, // Usa username invece di name
      email: teacher.email,
      image: teacher.image, // Ora il campo esiste nel schema
      packages: teacher.packages.map(pkg => ({
        id: pkg.id,
        name: pkg.name,
        description: pkg.description,
        lessonCount: pkg.lessonCount,
        duration: pkg.duration,
        price: Number(pkg.price), // Converte Decimal a number
        isActive: pkg.isActive,
        createdAt: pkg.createdAt.toISOString(),
        updatedAt: pkg.updatedAt.toISOString(),
        studentsEnrolled: pkg.purchases.length, // Conta gli acquisti
      })),
    };
  } catch (error) {
    console.error("Errore nel recupero dei dati dell'insegnante:", error);
    throw new Error("Errore nel caricamento dei dati");
  }
}

export default async function TeacherPackagesPage({ params }: PageProps) {
  // Await dei params per Next.js 15+
  const resolvedParams = await params;
  const session = await auth();
  const teacher = await getTeacherWithPackages(resolvedParams.teacherId);

  if (!teacher) {
    notFound();
  }

  // Verifica se l'utente corrente è il proprietario del profilo
  const isOwner = session?.user?.id === resolvedParams.teacherId;

  return <TeacherPackagesClient teacher={teacher} isOwner={isOwner} />;
}

// Opzionale: metadata dinamici
export async function generateMetadata({ params }: PageProps) {
  const resolvedParams = await params;
  const teacher = await prisma.user.findUnique({
    where: { id: resolvedParams.teacherId },
    select: { username: true }, // Usa username invece di name
  });

  return {
    title: teacher ? `${teacher.username} - Pacchetti Lezioni` : "Insegnante non trovato",
    description: teacher ? `Scopri i pacchetti di lezioni di ${teacher.username}` : "",
  };
}
