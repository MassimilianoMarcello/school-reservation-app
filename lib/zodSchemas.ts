import { z } from "zod";

export const userSchema = z.object({
  username: z
    .string()
    .min(2, { message: "Name must be at least 2 characters long" })
    .max(50, { message: "Name must be at most 50 characters long" }),

  email: z
    .string()
    .email({ message: "Invalid email address" }),

  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .max(50, { message: "Password must be at most 50 characters long" })
    .refine(
      (val) =>
        /[A-Z]/.test(val) &&         // must include at least one uppercase letter
        /[0-9]/.test(val) &&         // must include at least one number
        /[!@#$%^&*(),.?":{}|<>]/.test(val), // must include at least one special character
      {
        message:
          "Password must include at least one uppercase letter, one number, and one special character",
      }
    ),
});

// Infer the TypeScript type from the schema
export type UserSchemaTypes = z.infer<typeof userSchema>;


export const loginSchema = z.object({
  email: z
    .string()
    .email({ message: "Invalid email address" }),

  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .max(50, { message: "Password must be at most 50 characters long" }),
});

export type LoginSchemaTypes = z.infer<typeof loginSchema>;

export const resetPasswordSchema = z.object({
  email: z.string().email(),
});
export type ResetPasswordSchemaTypes = z.infer<typeof resetPasswordSchema>;





export const resetPasswordConfirmSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long" })
      .max(50, { message: "Password must be at most 50 characters long" }),
      
    confirmPassword: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long" })
      .max(50, { message: "Password must be at most 50 characters long" }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"], // mostra l'errore su "confirmPassword"
  });

export type ResetPasswordConfirmSchemaTypes = z.infer<typeof resetPasswordConfirmSchema>;



export const changePasswordSchema = z
  .object({
    oldPassword: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long" })
      .max(50, { message: "Password must be at most 50 characters long" }),
     
      newPassword: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long" })
      .max(50, { message: "Password must be at most 50 characters long" })
      .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
      .regex(/\d/, { message: "Password must contain at least one number" })
      .regex(/[\W_]/, { message: "Password must contain at least one special character" }),
     
    confirmPassword: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long" })
      .max(50, { message: "Password must be at most 50 characters long" }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"], // SHOW ERROR ON confirmPassword
  });
export type ChangePasswordSchemaTypes = z.infer<typeof changePasswordSchema>;

  export const otpSchema = z.object({
    token: z
      .string()
      .length(6, 'Otp has to be 6 characters long')
      .regex(/^\d+$/, 'Otp must contain only numbers'),
  });
  export type OtpSchemaType = z.infer<typeof otpSchema>;