"use client";
import { useState } from "react";
import { LoginSchemaTypes, loginSchema } from "@/lib/zodSchemas";
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

import TopFormHeader from "./TopFormHeader";
import { KeyRound, Eye, EyeOff } from "lucide-react";
// import { useSession } from "next-auth/react";
import Link from "next/link";

import { useRouter } from "next/navigation";
import { login } from "@/app/actions/login";
import { signIn } from "next-auth/react";
// import { OtpForm } from "./OtpFormLogin";

const LoginForm = () => {
  const router = useRouter();
  
  // const { data: session } = useSession();

  const loginIcon = <KeyRound size={30} />;
  const [passwordVisible, setPasswordVisible] = useState(false); // Stato per la visibilità della password
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const togglePasswordVisibility = () => {
    setPasswordVisible((prev) => !prev); // Toggle della visibilità della password
  };

  const onSubmit = async (data: LoginSchemaTypes) => {
    setIsLoading(true);

    const res = await login(data);

    if (res?.error) {
      form.setError("email", {
        type: "manual",
        message: res.error,
      });
      setIsLoading(false);
      return;
    }

    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (result?.error) {
      form.setError("email", {
        type: "manual",
        message: "Invalid credentials",
      });
      setIsLoading(false);
      return;
    }



    router.push("/user/dashboard");
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-6 space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <TopFormHeader
              title="Login"
              subtitle="Access your account to get started."
              icon={loginIcon}
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
                </FormItem>
              )}
            />

            <FormDescription className="text-sm text-muted-foreground -mt-1 text-center space-y-1">
              New here?
              <Link href="/register">
                <span className=" ml-1 underline text-primary hover:text-primary/80 transition-colors">
                  Create an account
                </span>
              </Link>
            </FormDescription>
            <FormDescription className="text-sm text-muted-foreground -mt-4  text-center space-y-1">
              Forgot your password?
              <Link href="/reset-password-insert-email">
                <span className="ml-1 underline text-primary hover:text-primary/80 transition-colors">
                  Reset it here
                </span>
              </Link>
            </FormDescription>

            <Button type="submit" className="w-full -mt-1" disabled={isLoading}>
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <span className="animate-spin h-4 w-4 border-2 border-t-transparent border-white rounded-full" />
                  Logging in...
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
  );
};

export default LoginForm;
