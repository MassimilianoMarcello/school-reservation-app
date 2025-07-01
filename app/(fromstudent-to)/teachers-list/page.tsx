// app/teachers/page.tsx
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma"; // adatta il path al tuo file prisma client

export default async function TeachersPage() {
  const teachers = await prisma.user.findMany({
    where: {
      role: "TEACHER",
    },
    select: {
      id: true,
      username: true,
      email: true,
      image: true,
    },
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Insegnanti</h1>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {teachers.map((teacher) => (
          <li
            key={teacher.id}
            className="p-4 border rounded-xl shadow hover:shadow-md transition"
          >
            <div className="flex items-center gap-4">
              <Image
                src={teacher.image ?? "/default-avatar.png"}
                alt={teacher.username ?? "Insegnante"}
                width={50}
                height={50}
                className="rounded-full object-cover"
              />
              <div>
                <p className="font-semibold">{teacher.username ?? "Senza nome"}</p>
                <p className="text-sm text-gray-600">{teacher.email}</p>
              </div>
            </div>
            <Link
              href={`/teacher-profile/${teacher.id}`}
              className="text-blue-600 hover:underline text-sm mt-2 inline-block"
            >
              Vedi profilo →
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
