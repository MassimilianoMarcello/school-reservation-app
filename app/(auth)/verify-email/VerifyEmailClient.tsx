'use client';

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { verificationEmail } from "@/app/actions/verificationEmail";
import TopFormHeader from "@/components/Auth-forms/TopFormHeader";
import { Loader } from "@/components/Auth-forms/Loader";
import { CheckCircle, XCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function VerifyEmailClient() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState<boolean | null>(null);

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setSuccess(false);
        setLoading(false);
        return;
      }

      const response = await verificationEmail(token);
      setSuccess(response.success);
      setLoading(false);
    };

    verify();
  }, [token]);

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4">
      {success ? (
        <div className="w-full max-w-md bg-white rounded-xl shadow-md p-8 space-y-6">
          <TopFormHeader
            title="Email Verified!"
            subtitle="Thank you for confirming your email."
            icon={<CheckCircle className="h-12 w-12 text-green-600" />}
          />
          <div className="flex justify-center">
            <Link
              href="/login"
              className="text-xl font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-2"
            >
              Go to Login Page <ArrowRight className="h-5 w-5 text-blue-600" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-md bg-white rounded-xl shadow-md p-8 space-y-6">
          <TopFormHeader
            title="Verification Failed"
            subtitle="The link has expired or is invalid."
            icon={<XCircle className="h-12 w-12 text-red-600" />}
          />
          <p className="text-center text-gray-600 mt-4">
            Please request a new verification email.
          </p>
          <div className="flex justify-center">
            <Link
              href="/resend-verification"
              className="text-xl font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-2 mt-6"
            >
              Resend Verification Email <ArrowRight className="h-5 w-5 text-blue-600" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
