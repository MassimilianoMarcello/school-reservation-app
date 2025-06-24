import NavbarUserDashboard from "@/components/User/UserNabar";
import {auth }from "@/auth"
import TopFormHeader from "@/components/Auth-forms/TopFormHeader";
import { TriangleAlertIcon } from "lucide-react";
import { redirect } from "next/navigation";
export default async function  AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
    const session = await auth()
    
      if (session?.user?.isTwoFactorEnabled && !session?.user?.twoFactorPass) {
        redirect('/login');
      }


    if (session?.user?.role !== "ADMIN") {
        return <div>

<div className="flex flex-col items-center justify-center min-h-screen">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 space-y-6">
        <TopFormHeader
          title="Unauthorized!"
          subtitle="You do not have permission to access this page."
          icon={<TriangleAlertIcon className="h-12 w-12 text-red-600" />}
        />
      </div>
    </div>
        </div>;
      }
      
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background">
          <NavbarUserDashboard />
          {children}
        </div>
      );
    }      