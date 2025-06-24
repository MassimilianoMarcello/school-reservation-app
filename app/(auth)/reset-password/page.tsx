// app/(auth)/reset-password/page.tsx
import NewPasswordForm from "@/components/Auth-forms/ResetPasswordInsertNewPasswords"

type ResetPasswordPageProps = {
  searchParams: Promise<{
    token?: string;
  }>;
};

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  // Await per ottenere i searchParams
  const params = await searchParams;
  const token = params.token;

  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">Invalid or missing token.</p>
      </div>
    );
  }

  return <NewPasswordForm token={token} />;
}

