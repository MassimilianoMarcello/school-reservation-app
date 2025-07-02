// actions/profile-actions.ts
"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { teacherProfileSchema, studentProfileSchema, type TeacherProfileFormData, type StudentProfileFormData } from "@/lib/zodSchemas"
import { revalidatePath } from "next/cache"
// import { redirect } from "next/navigation"
import z from "zod"

// Funzione helper per verificare se l'utente ha un profilo
export async function checkUserProfile() {
  const session = await auth()
  
  if (!session?.user?.id) {
    return { hasProfile: false, profileType: null, user: null }
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      teacherProfile: true,
      studentProfile: true,
    }
  })

  if (!user) {
    return { hasProfile: false, profileType: null, user: null }
  }

  const hasTeacherProfile = !!user.teacherProfile
  const hasStudentProfile = !!user.studentProfile
  const hasProfile = hasTeacherProfile || hasStudentProfile
  
  let profileType: "teacher" | "student" | null = null
  if (hasTeacherProfile) profileType = "teacher"
  else if (hasStudentProfile) profileType = "student"

  return { 
    hasProfile, 
    profileType, 
    user: {
      ...user,
      teacherProfile: user.teacherProfile,
      studentProfile: user.studentProfile
    }
  }
}

// Server Action per creare TeacherProfile
export async function createTeacherProfile(data: TeacherProfileFormData) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return { error: "Non autenticato" }
    }

    // Verifica che l'utente abbia il ruolo TEACHER
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { teacherProfile: true }
    })

    if (!user) {
      return { error: "Utente non trovato" }
    }

    if (user.role !== "TEACHER") {
      return { error: "Non hai i permessi per creare un profilo insegnante" }
    }

    if (user.teacherProfile) {
      return { error: "Hai già un profilo insegnante" }
    }

    // Validazione dei dati
    const validatedData = teacherProfileSchema.parse(data)

    // Creazione del profilo
    await prisma.teacherProfile.create({
      data: {
        userId: user.id,
        title: validatedData.title,
        bio: validatedData.bio,
        nativeLanguages: validatedData.nativeLanguages,
        teachingLanguages: validatedData.teachingLanguages,
        hourlyRate: validatedData.hourlyRate,
        trialLessonRate: validatedData.trialLessonRate || null,
        timezone: validatedData.timezone || null,
        experience: validatedData.experience || null,
        education: validatedData.education || null,
      }
    })

    // Aggiorna profileComplete
    await prisma.user.update({
      where: { id: user.id },
      data: { profileComplete: true }
    })

    revalidatePath("/dashboard")
    return { success: "Profilo insegnante creato con successo!" }

  } catch (error) {
    console.error("Errore nella creazione del profilo insegnante:", error)
    if (error instanceof z.ZodError) {
      return { error: "Dati non validi" }
    }
    return { error: "Errore durante la creazione del profilo" }
  }
}

// Server Action per creare StudentProfile
export async function createStudentProfile(data: StudentProfileFormData) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return { error: "Non autenticato" }
    }

    // Verifica che l'utente abbia il ruolo USER (studente)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { studentProfile: true }
    })

    if (!user) {
      return { error: "Utente non trovato" }
    }

    if (user.role !== "TEACHER") {
      return { error: "Non hai i permessi per creare un profilo studente" }
    }

    if (user.studentProfile) {
      return { error: "Hai già un profilo studente" }
    }

    // Validazione dei dati
    const validatedData = studentProfileSchema.parse(data)

    // Creazione del profilo
    await prisma.studentProfile.create({
      data: {
        userId: user.id,
        nativeLanguage: validatedData.nativeLanguage,
        learningLanguages: validatedData.learningLanguages,
        currentLevel: validatedData.currentLevel,
        learningGoals: validatedData.learningGoals,
        timezone: validatedData.timezone || null,
        preferredSchedule: validatedData.preferredSchedule || null,
      }
    })

    // Aggiorna profileComplete
    await prisma.user.update({
      where: { id: user.id },
      data: { profileComplete: true }
    })

    revalidatePath("/dashboard")
    return { success: "Profilo studente creato con successo!" }

  } catch (error) {
    console.error("Errore nella creazione del profilo studente:", error)
    if (error instanceof z.ZodError) {
      return { error: "Dati non validi" }
    }
    return { error: "Errore durante la creazione del profilo" }
  }
}