// app/teacher/[id]/page.tsx
import { prisma } from "@/lib/prisma"; // adatta il path
import Image from "next/image";
import { notFound } from "next/navigation";

export default async function TeacherProfilePage({ params }: { params: { id: string } }) {
  const teacher = await prisma.user.findUnique({
    where: { id: params.id },
    select: {
      username: true,
      email: true,
      image: true,
      role: true,
    },
  });

  if (!teacher || teacher.role !== "TEACHER") {
    return notFound();
  }

  return (
    <div className="max-w-xl mx-auto py-10 px-4">
      <div className="flex items-center gap-6">
        <Image
          src={teacher.image ?? "/default-avatar.png"}
          alt={teacher.username ?? "Insegnante"}
          width={100}
          height={100}
          className="rounded-full object-cover"
        />
        <div>
          <h1 className="text-2xl font-bold">{teacher.username ?? "Senza nome"}</h1>
          <p className="text-gray-600">{teacher.email}</p>
        </div>
      </div>
      <p className="mt-4 text-gray-700">Questo è il profilo dell insegnante.</p>
    </div>
  );
}
