import React from 'react'
import { LessonPackageForm as CreatePackageForm } from '@/components/Teacher/CreatePackageForm'
import {auth} from "@/auth";
const CreatePackages = async () => {
    const session = await auth();
  return (
    <div>
      <CreatePackageForm teacherId={session?.user?.id ?? ''} />
     
    </div>
  )
}

export default CreatePackages