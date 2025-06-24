import { auth } from "@/auth";
import NavbarUserDashboard from "@/components/User/UserNabar";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
// if user is not authenticated, redirect to login
  if (!session || !session.user?.email) {
    redirect("/login"); 
  }

  const user = await prisma.user.findUnique({
    where: { email: session?.user.email },
  });

  if (!user) {
    redirect("/login"); // user not found, redirect
  }



  return (
    <div className="flex flex-col min-h-screen bg-background ">
      <NavbarUserDashboard />
      <main className="flex-1">{children}</main>
    </div>
  );
}

