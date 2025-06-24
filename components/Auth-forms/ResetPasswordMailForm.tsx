"use client";

import React, { useState } from "react";
import {
  resetPasswordSchema,
  ResetPasswordSchemaTypes,
} from "@/lib/zodSchemas";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import TopFormHeader from "./TopFormHeader";
import { CheckCircle, KeyRound, Loader2 } from "lucide-react";
import { resetPassword } from "@/app/actions/authActions/resetPasswordSendMail";

const ResetMailForm = () => {
  const [emailSent, setEmailSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const loginIcon = <KeyRound size={30} />;

  const form = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ResetPasswordSchemaTypes) => {
    setLoading(true);
    const res = await resetPassword(data);
    setLoading(false);

    if (res?.error) {
      form.setError("email", {
        type: "manual",
        message: res.error,
      });
    } else {
      setEmailSent(true);
    }
  };

  return emailSent ? (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 space-y-6">
        <TopFormHeader
          title="Success!"
          subtitle="An email has been sent to you with instructions to reset your password."
          icon={<CheckCircle className="h-12 w-12 text-green-600" />}
        />
      </div>
    </div>
  ) : (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-6 space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <TopFormHeader
              title="Reset Password"
              subtitle="Enter your email and you will receive instructions to reset your password."
              icon={loginIcon}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} disabled={loading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full -mt-1" disabled={loading}>
              {loading && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
              {loading ? "Sending..." : "Submit"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default ResetMailForm;