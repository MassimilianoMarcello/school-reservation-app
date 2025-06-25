import { EditLessonPackageForm } from "@/components/Teacher/EditLessonPackageForm";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function EditPackagePage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const session = await auth();
  
  if (!session?.user?.id || session.user.role !== "TEACHER") {
    redirect("/auth/signin");
  }

  const packageId = parseInt(params.id);
  
  if (isNaN(packageId)) {
    redirect("/teacher/packages");
  }

  return (
    <div className="container py-8">
      <EditLessonPackageForm 
        packageId={packageId}
        teacherId={session.user.id}
      />
    </div>
  );
}