"use client";

import { useState } from "react";
import { resendVerificationEmail } from "@/app/actions/resendeVerificationMail"; // Server action corretta
import { Input } from "@/components/ui/input"; // Se usi shadcn/ui
import { Button } from "@/components/ui/button";

export default function ResendVerificationPage() {
  const [email, setEmail] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");
    setIsLoading(true);

    const result = await resendVerificationEmail(email);

    if (result.success) {
      setSuccessMessage(result.message || "");
    } else {
      setErrorMessage(result.error || "An error occurred.");
    }

    setIsLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-md">
      <h1 className="text-2xl font-bold mb-4 text-center">
        Resend Verification Email
      </h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Sending..." : "Send New Verification Link"}
        </Button>
      </form>

      {successMessage && (
        <p className="text-green-600 mt-4 text-center">{successMessage}</p>
      )}
      {errorMessage && (
        <p className="text-red-600 mt-4 text-center">{errorMessage}</p>
      )}
    </div>
  );
}
