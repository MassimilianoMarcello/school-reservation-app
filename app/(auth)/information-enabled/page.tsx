import TopFormHeader from "@/components/Auth-forms/TopFormHeader";
import { ArrowRight, CheckCircle, KeyRound } from "lucide-react";
import Link from "next/link";
import React from "react";

const page = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 space-y-6">
        <TopFormHeader
          title="Success!"
          subtitle="You have successfully enabled the feature."
          icon={<CheckCircle className="h-12 w-12 text-green-600" />}
        />
        <Link
          href="/login"
          className="mt-2 flex items-center justify-center text-blue-600 hover:underline gap-2"
        >
          Go to Login Page
          <KeyRound className="h-5 w-5" />
          <ArrowRight className="h-5 w-5" />
        </Link>
      </div>
    </div>
  );
};

export default page;
