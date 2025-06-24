"use client";

import { useState } from "react";
import {
  ResetPasswordConfirmSchemaTypes,
  resetPasswordConfirmSchema,
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
import {
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle,
  Circle,
  ArrowRight,
} from "lucide-react";
// import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { resetPassword } from "@/app/actions/authActions/resetPasswordAction";
// import router from "next/router";

import clsx from "clsx";

const InsertNewPasswordsForm = ({ token }: { token: string }) => {

  const loginIcon = <KeyRound size={30} />;

  const [newPasswordVisible, setNewPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [changedPassword, setChangedPassword] = useState(false);
  const form = useForm<z.infer<typeof resetPasswordConfirmSchema>>({
    resolver: zodResolver(resetPasswordConfirmSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const password = form.watch("newPassword");

  const passwordRules = [
    {
      label: "At least 8 characters",
      isValid: (pw: string) => pw.length >= 8,
    },
    {
      label: "At least one uppercase letter",
      isValid: (pw: string) => /[A-Z]/.test(pw),
    },
    {
      label: "At least one number",
      isValid: (pw: string) => /[0-9]/.test(pw),
    },
    {
      label: "At least one symbol",
      isValid: (pw: string) => /[^A-Za-z0-9]/.test(pw),
    },
  ];

  const toggleNewPasswordVisibility = () => {
    setNewPasswordVisible((prev) => !prev);
  };

  const toggleConfirmPasswordVisibility = () => {
    setConfirmPasswordVisible((prev) => !prev);
  };

  const onSubmit = async (data: ResetPasswordConfirmSchemaTypes) => {
    if (!token) {
      form.setError("root", {
        type: "manual",
        message: "Token is missing",
      });
      return;
    }

    const { newPassword } = data;
    const res = await resetPassword(token, newPassword);

    if (res?.error) {
      form.setError("root", {
        type: "manual",
        message: res.error,
      });
    } else {
     
      setChangedPassword(true);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted px-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-md p-6 space-y-6">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return changedPassword ? (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 space-y-6">
        <TopFormHeader
          title="Success!"
          subtitle="You have successfully changed your password."
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
  ) : (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-6 space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <TopFormHeader
              title="New Password"
              subtitle="Insert a new password and confirm it"
              icon={loginIcon}
            />

            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={newPasswordVisible ? "text" : "password"} // Separato per newPassword
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={toggleNewPasswordVisibility}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                      >
                        {newPasswordVisible ? (
                          <EyeOff size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {password && password.length > 0 && (
              <ul className="mt-3 space-y-1">
                {passwordRules.map((rule, i) => {
                  const valid = rule.isValid(password || "");
                  return (
                    <li
                      key={i}
                      className={clsx(
                        "flex items-center gap-2 text-sm",
                        valid ? "text-green-600" : "text-muted-foreground"
                      )}
                    >
                      {valid ? (
                        <CheckCircle size={16} className="text-green-600" />
                      ) : (
                        <Circle size={16} />
                      )}
                      <span>{rule.label}</span>
                    </li>
                  );
                })}
              </ul>
            )}

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={confirmPasswordVisible ? "text" : "password"} // Separato per confirmPassword
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={toggleConfirmPasswordVisibility}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                      >
                        {confirmPasswordVisible ? (
                          <EyeOff size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full -mt-1">
              Submit
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default InsertNewPasswordsForm;