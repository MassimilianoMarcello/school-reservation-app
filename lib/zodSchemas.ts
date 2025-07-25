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


  // teacher schemas





// Schema per i pacchetti lezioni
export const lessonPackageSchema = z.object({
  name: z
    .string()
    .min(1, "The name is required")
    .max(100, "The name must be at most 100 characters"),
  
  description: z
    .string()
    .max(500, "The description must be at most 500 characters")
    .optional(),
  
  lessonCount: z
    .number({
      required_error: "The lesson count is required",
      invalid_type_error: "The lesson count must be a number"
    })
    .min(1, "The package must contain at least 1 lesson")
    .max(50, "The package can contain at most 50 lessons"),

  duration: z
    .number({
      required_error: "The duration is required",
      invalid_type_error: "The duration must be a number"
    })
    .min(15, "The minimum duration is 15 minutes")
    .max(300, "The maximum duration is 300 minutes"),

  price: z
    .number({
      required_error: "The price is required",
      invalid_type_error: "The price must be a number"
    })
    .min(0.01, "The price must be greater than 0")
    .max(1000, "The maximum price is 1000€"),
});

// Tipo inferito dallo schema
export type LessonPackageInput = z.infer<typeof lessonPackageSchema>;


// schemi di profilo

// Opzioni predefinite per le lingue
export const LANGUAGES = [
  "Italian", "English", "Spanish", "French", "German", "Portuguese", 
  "Russian", "Chinese", "Japanese", "Korean", "Arabic", "Dutch", 
  "Swedish", "Polish", "Turkish", "Hindi"
] as const

export const LEVELS = ["Beginner", "Intermediate", "Advanced"] as const

export const LEARNING_GOALS = [
  "Travel", "Business", "Exam", "Conversation", "Academic", "Personal Interest"
] as const

export const TIMEZONES = [
  "Europe/Rome", "Europe/London", "America/New_York", "America/Los_Angeles",
  "Asia/Tokyo", "Australia/Sydney", "Europe/Berlin", "Europe/Madrid"
] as const

// Schema per TeacherProfile
export const teacherProfileSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title too long"),
  bio: z.string().min(10, "Bio must be at least 10 characters").max(1000, "Bio too long"),
  nativeLanguages: z.array(z.string()).min(1, "Select at least one native language"),
  teachingLanguages: z.array(z.string()).min(1, "Select at least one teaching language"),
  hourlyRate: z.coerce.number().min(5, "Minimum rate is $5").max(200, "Maximum rate is $200"),
  trialLessonRate: z.coerce.number().min(0, "Trial rate cannot be negative").max(200, "Maximum rate is $200").optional(),
  timezone: z.string().optional(),
  experience: z.string().max(500, "Experience description too long").optional(),
  education: z.string().max(500, "Education description too long").optional(),
})

// Schema per StudentProfile
export const studentProfileSchema = z.object({
  nativeLanguage: z.string().min(1, "Native language is required"),
  learningLanguages: z.array(z.string()).min(1, "Select at least one language to learn"),
  currentLevel: z.enum(LEVELS, { required_error: "Please select your current level" }),
  learningGoals: z.array(z.string()).min(1, "Select at least one learning goal"),
  timezone: z.string().optional(),
  preferredSchedule: z.string().max(200, "Preferred schedule too long").optional(),
})

export type TeacherProfileFormData = z.infer<typeof teacherProfileSchema>
export type StudentProfileFormData = z.infer<typeof studentProfileSchema>