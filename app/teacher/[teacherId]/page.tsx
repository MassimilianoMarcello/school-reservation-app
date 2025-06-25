// app/teacher/[teacherId]/page.tsx
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { TeacherPackagesClient } from "@/components/Teacher/teacherPackagesList";

interface PageProps {
  params: Promise<{
    teacherId: string;
  }>;
}

async function getTeacherWithPackages(teacherId: string, isOwner: boolean = false) {
  try {
    const teacher = await prisma.user.findUnique({
      where: {
        id: teacherId,
      },
      include: {
        packages: {
          // ✅ CORREZIONE: Solo per visitatori esterni filtra per isActive
          where: isOwner ? {} : { isActive: true },
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
      name: teacher.username,
      email: teacher.email,
      image: teacher.image,
      packages: teacher.packages.map(pkg => ({
        id: pkg.id,
        name: pkg.name,
        description: pkg.description,
        lessonCount: pkg.lessonCount,
        duration: pkg.duration,
        price: Number(pkg.price),
        isActive: pkg.isActive,
        createdAt: pkg.createdAt.toISOString(),
        updatedAt: pkg.updatedAt.toISOString(),
        studentsEnrolled: pkg.purchases.length,
      })),
    };
  } catch (error) {
    console.error("Errore nel recupero dei dati dell'insegnante:", error);
    throw new Error("Errore nel caricamento dei dati");
  }
}

export default async function TeacherPackagesPage({ params }: PageProps) {
  const resolvedParams = await params;
  const session = await auth();
  
  // Verifica se l'utente corrente è il proprietario del profilo
  const isOwner = session?.user?.id === resolvedParams.teacherId;
  
  // ✅ Passa il flag isOwner alla query
  const teacher = await getTeacherWithPackages(resolvedParams.teacherId, isOwner);

  if (!teacher) {
    notFound();
  }

  return <TeacherPackagesClient teacher={teacher} isOwner={isOwner} />;
}

export async function generateMetadata({ params }: PageProps) {
  const resolvedParams = await params;
  const teacher = await prisma.user.findUnique({
    where: { id: resolvedParams.teacherId },
    select: { username: true },
  });

  return {
    title: teacher ? `${teacher.username} - Pacchetti Lezioni` : "Insegnante non trovato",
    description: teacher ? `Scopri i pacchetti di lezioni di ${teacher.username}` : "",
  };
}
