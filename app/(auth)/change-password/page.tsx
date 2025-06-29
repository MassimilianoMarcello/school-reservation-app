import ChangePasswordsForm from "@/components/Auth-forms/ChangePassword"
import {auth}  from "@/auth"
import { prisma } from "@/lib/prisma";
import TopFormHeader from "@/components/Auth-forms/TopFormHeader";
import { CheckCircle } from "lucide-react";

const ChangePassword = async () => {
  const session = await auth();
  
  if (!session) {
    return <div>Unauthorized</div>;
  }
  
  if (!session?.user?.email) {
    return <div>Unauthorized: No email found.</div>;
  }
  
  const user = await prisma.user.findUnique({
    where: { email: session.user.email as string },
  });
  
  // Check if user doesn't exist or doesn't have a password (OAuth user)
  if (!user || !user.password) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 space-y-6">
          <TopFormHeader
            title="Ooops! We are sorry!"
            subtitle={!user ? "User not found." : "Cannot change password for OAuth users."}
            icon={<CheckCircle className="h-12 w-12 text-green-600" />}
          />
        </div>
      </div>
    );
  }
       
  return (
    <div>
      <ChangePasswordsForm />
    </div>
  )
}

export default ChangePassword