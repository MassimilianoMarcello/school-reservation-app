import { auth } from "@/auth";
import { NavigationMenuDemo as TeacherNavbar } from "@/components/Navbar/TeacherNavbar";
import { NavigationMenuDemo as StudentNavbar } from "@/components/Navbar/StudentNavbar";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Se l'utente non è autenticato, redirect al login
  if (!session || !session.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    redirect("/login"); // Utente non trovato
  }

  // Se il ruolo non è TEACHER, redirect
//   if (session.user.role !== "TEACHER") {
//     redirect("/unauthorized"); // oppure /dashboard o qualsiasi altra pagina
//   }

  return (
    <div>
      <h1>Hi {session?.user?.username}, teacher</h1>
      <TeacherNavbar />
      <StudentNavbar />
    
      <main>{children}</main>
    </div>
  );
}