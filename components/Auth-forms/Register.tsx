'use client'
import { useState } from "react"; // Aggiungi useState per gestire la visibilità della password
import { userSchema, UserSchemaTypes } from "@/lib/zodSchemas";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import TopFormHeader from "./TopFormHeader";
import {Circle, CircleUserRound, Eye, EyeOff, CheckCircle, MailCheck } from "lucide-react"; // Aggiungi le icone Eye e EyeOff
import Link from "next/link";
import clsx from "clsx";
import { registerUser } from "@/app/actions/register";

import { signIn } from "next-auth/react";

const RegisterForm = () => {
    
  const registerIcon = <CircleUserRound size={30} />;
  const [passwordVisible, setPasswordVisible] = useState(false); // Stato per la visibilità della password
  const [veryficationMailAd,setVerificationMailAd] = useState(false); 
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  const password = form.watch("password");

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

  const togglePasswordVisibility = () => {
    setPasswordVisible((prev) => !prev); 
  };

  
  // TYPE FOR ERRORS
interface RegisterError {
  email?: {
    _errors: string[];
  };
  general?: {
    _errors: string[];
  };
}

async function onSubmit(values: UserSchemaTypes) {
  setIsSubmitting(true);

  try {
   
    const submitData = await registerUser(values);
// ERROR HANDLING
    if (!submitData?.success) {
      const errorMessages: RegisterError = submitData.errors || {};

      if (errorMessages?.email) {
        form.setError("email", { message: errorMessages.email._errors[0] });
      } else if (errorMessages?.general) {
        form.setError("root", { message: errorMessages.general._errors[0] });
      } else {
        form.setError("root", { message: "Something went wrong!" });
      }
    } else {
      // If registration was successful
      toast.success("Registration successful!");
      form.reset();
      setVerificationMailAd(true);
    }
  } catch {
    // MANAGE GENERIC ERRORS
    form.setError("root", { message: "An error occurred during registration." });
  } finally {
    setIsSubmitting(false);
  }
}

  

  return (
    veryficationMailAd ? (
      <div className="flex flex-col items-center justify-center min-h-screen">
<div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 space-y-6">
  <TopFormHeader
    title="Please Verify Your Email!"
    subtitle="We've sent a verification link to your email address."
    icon={<MailCheck className="h-12 w-12 text-blue-600" />}
  />
  <p className="text-center text-gray-500 mt-4">
  Didn&apos;t receive the email? Please check your Spam or Promotions folder.<br />
  If you still can&apos;t find it, request a new verification link.
  </p>
</div>
</div>

    ) : (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-6 space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <TopFormHeader
              title="Register"
              subtitle="Join us by creating a new account."
              icon={registerIcon}
            />

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                  
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                     
                        type={passwordVisible ? "text" : "password"} // Usa lo stato per gestire il tipo dell'input
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                      >
                        {passwordVisible ? (
                          <EyeOff size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />

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
                </FormItem>
              )}
            />

            <FormDescription className="text-sm text-muted-foreground mt-4 text-center">
              <Link href="/user/login">
                Already registered?{" "}
                <span className="underline text-primary hover:text-primary/80 transition-colors">
                  Login
                </span>
              </Link>
            </FormDescription>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
  {isSubmitting ? (
    <div className="flex items-center justify-center gap-2">
      <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white" />
      Registering...
    </div>
  ) : (
    "Submit"
  )}
</Button>

             <div className="flex items-center -mt-4 mb-1 ">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="mx-4 text-gray-400">OR</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>
            
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => signIn("google", { callbackUrl: "/user/dashboard" })}
            >
            <svg
                className="w-5 h-5"
                viewBox="0 0 533.5 544.3"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M533.5 278.4c0-17.6-1.6-34.6-4.7-51H272v96.8h146.9c-6.3 33.7-25.1 62.2-53.5 81.4v67h86.4c50.6-46.6 81.7-115.5 81.7-194.2z"
                  fill="#4285f4"
                />
                <path
                  d="M272 544.3c72.6 0 133.6-24 178.2-65.2l-86.4-67c-24 16.1-54.6 25.6-91.8 25.6-70.6 0-130.5-47.6-151.9-111.4h-89.7v69.9c44.5 88.3 136.1 148.1 241.6 148.1z"
                  fill="#34a853"
                />
                <path
                  d="M120.1 326.3c-10.5-31.4-10.5-65.6 0-97l-89.7-69.9C7.5 215.6 0 245.8 0 278.4s7.5 62.8 20.4 90.1l89.7-69.9z"
                  fill="#fbbc04"
                />
                <path
                  d="M272 107.7c39.5 0 75 13.6 103.1 40.4l77.4-77.4C405.6 24.2 344.6 0 272 0 166.5 0 74.9 59.8 30.4 148.1l89.7 69.9c21.4-63.8 81.3-111.4 151.9-111.4z"
                  fill="#ea4335"
                />
              </svg>
              Sign in with Google
            </Button>
          </form>
        </Form>
      </div>
    </div>
  ))}
;

export default RegisterForm;



