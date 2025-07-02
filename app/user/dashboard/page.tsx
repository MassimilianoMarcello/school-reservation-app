import { auth } from "@/auth";
import { prisma } from "@/lib/prisma"; 
// import TwoFAuth from "@/components/Auth-forms/TwoFAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
// import { redirect } from "next/navigation";

export default async function Page() {
  const session = await auth();

  if (!session) return <div>Not authenticated</div>;

  // ⛏️ Prendi i dati freschi dal DB usando l'email della sessione
  const email = session.user.email;
  if (!email) return <div>User email not found</div>;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) return <div>User not found</div>;



  const isAdmin = user.role === "ADMIN";

  return (
    <Card className="w-full h-screen mx-auto mt-8 max-w-none">
      <CardHeader>
        <CardTitle>Welcome, {user.email}</CardTitle>
        {isAdmin && (
          <Button asChild className="mt-4" variant="default">
            <Link href="/ad-dashboard">Admin Panel</Link>
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <pre className="text-sm bg-muted p-4 rounded-md overflow-x-auto">
          {JSON.stringify(user, null, 2)}
        </pre>
       
      </CardContent>
    </Card>
  );
}

