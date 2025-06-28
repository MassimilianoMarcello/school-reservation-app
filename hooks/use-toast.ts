"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

// Types per le validazioni
export interface CreateManualSlotData {
  date: Date
  startTime: string
  duration: number
}

export interface CreateTemplateData {
  name: string
  weekDays: number[]
  startTime: string
  endTime: string
  duration: number
  startDate: Date
  endDate: Date
}

// Tipo per i TimeSlot con bookings (deve essere esportato per il componente)
export interface TimeSlotWithBookings {
  id: number
  teacherId: string
  date: Date
  startTime: string
  endTime: string
  duration: number
  source: 'MANUAL' | 'TEMPLATE'
  templateId: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  bookings: {
    id: number
    status: string
    student: {
      id: string
      username: string | null
      email: string
    }
  }[]
}

// === UTILITIES ===

function calculateEndTime(startTime: string, duration: number): string {
  const [hours, minutes] = startTime.split(':').map(Number)
  const totalMinutes = hours * 60 + minutes + duration
  const newHours = Math.floor(totalMinutes / 60)
  const newMinutes = totalMinutes % 60
  return `${newHours.toString().padStart(2, "0")}:${newMinutes.toString().padStart(2, "0")}`
}

function generateTimeSlots(startTime: string, endTime: string, duration: number) {
  const slots = []
  const [startHour, startMin] = startTime.split(':').map(Number)
  const [endHour, endMin] = endTime.split(':').map(Number)
  
  let currentMinutes = startHour * 60 + startMin
  const endMinutes = endHour * 60 + endMin
  
  while (currentMinutes + duration <= endMinutes) {
    const slotStartTime = `${Math.floor(currentMinutes / 60).toString().padStart(2, '0')}:${(currentMinutes % 60).toString().padStart(2, '0')}`
    const slotEndTime = calculateEndTime(slotStartTime, duration)
    
    slots.push({
      startTime: slotStartTime,
      endTime: slotEndTime
    })
    
    currentMinutes += duration
  }
  
  return slots
}

async function getAuthenticatedTeacher() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/auth/signin")
  }
  
  // Verifica che sia un teacher
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true }
  })
  
  if (!user || user.role !== "TEACHER") {
    redirect("/unauthorized")
  }
  
  return user.id
}

// === READ OPERATIONS ===

export async function getTeacherTimeSlots(teacherId?: string) {
  const currentTeacherId = teacherId || await getAuthenticatedTeacher()
  
  try {
    const timeSlots = await prisma.timeSlot.findMany({
      where: {
        teacherId: currentTeacherId,
        isActive: true
      },
      include: {
        bookings: {
          where: {
            status: {
              not: "CANCELLED"
            }
          },
          include: {
            student: {
              select: {
                id: true,
                username: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: [
        { date: "asc" },
        { startTime: "asc" }
      ]
    })
    
    return { success: true, data: timeSlots }
  } catch (error) {
    console.error("Error fetching time slots:", error)
    return { success: false, error: "Errore nel caricamento degli slot" }
  }
}

export async function getTeacherTimeSlotsForDate(date: Date, teacherId?: string) {
  const currentTeacherId = teacherId || await getAuthenticatedTeacher()
  
  try {
    // CORREZIONE: Usa una data normalizzata per evitare problemi di timezone
    const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    
    const timeSlots = await prisma.timeSlot.findMany({
      where: {
        teacherId: currentTeacherId,
        date: targetDate
      },
      include: {
        bookings: {
          where: {
            status: {
              not: "CANCELLED"
            }
          },
          include: {
            student: {
              select: {
                id: true,
                username: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: { startTime: "asc" }
    })
    
    return { success: true, data: timeSlots }
  } catch (error) {
    console.error("Error fetching time slots for date:", error)
    return { success: false, error: "Errore nel caricamento degli slot per la data" }
  }
}

export async function getTeacherTemplateGroups(teacherId?: string) {
  const currentTeacherId = teacherId || await getAuthenticatedTeacher()
  
  try {
    const templateSlots = await prisma.timeSlot.findMany({
      where: {
        teacherId: currentTeacherId,
        source: "TEMPLATE",
        templateId: {
          not: null
        }
      },
      select: {
        templateId: true,
        duration: true,
        startTime: true,
        endTime: true,
        date: true,
        createdAt: true
      },
      orderBy: { createdAt: "desc" }
    })
    
    // Raggruppa per templateId
    const groups = templateSlots.reduce((acc, slot) => {
      if (!slot.templateId) return acc
      
      if (!acc[slot.templateId]) {
        acc[slot.templateId] = {
          templateId: slot.templateId,
          slots: [],
          count: 0,
          createdAt: slot.createdAt
        }
      }
      
      acc[slot.templateId].slots.push(slot)
      acc[slot.templateId].count++
      
      return acc
    }, {} as Record<string, any>)
    
    return { success: true, data: Object.values(groups) }
  } catch (error) {
    console.error("Error fetching template groups:", error)
    return { success: false, error: "Errore nel caricamento dei template" }
  }
}

// === CREATE OPERATIONS ===

export async function createManualTimeSlot(data: CreateManualSlotData) {
  const teacherId = await getAuthenticatedTeacher()
  
  try {
    const endTime = calculateEndTime(data.startTime, data.duration)
    
    // CORREZIONE: Normalizza la data per evitare problemi di timezone
    const targetDate = new Date(data.date.getFullYear(), data.date.getMonth(), data.date.getDate())
    
    // Controllo sovrapposizioni più robusto
    const existingSlot = await prisma.timeSlot.findFirst({
      where: {
        teacherId,
        date: targetDate,
        OR: [
          {
            // Slot che inizia nello stesso momento
            startTime: data.startTime
          },
          {
            // Slot che si sovrappone
            AND: [
              { startTime: { lt: endTime } },
              { endTime: { gt: data.startTime } }
            ]
          }
        ]
      }
    })
    
    if (existingSlot) {
      return { success: false, error: "Esiste già un time slot che si sovrappone con questo orario" }
    }
    
    const timeSlot = await prisma.timeSlot.create({
      data: {
        teacherId,
        date: targetDate,
        startTime: data.startTime,
        endTime,
        duration: data.duration,
        source: "MANUAL",
        isActive: true
      },
      include: {
        bookings: {
          where: {
            status: {
              not: "CANCELLED"
            }
          },
          include: {
            student: {
              select: {
                id: true,
                username: true,
                email: true
              }
            }
          }
        }
      }
    })
    
    revalidatePath("/teacher/calendar")
    return { success: true, data: timeSlot }
  } catch (error) {
    console.error("Error creating manual time slot:", error)
    return { success: false, error: "Errore nella creazione dello slot" }
  }
}

export async function createTemplateTimeSlots(data: CreateTemplateData) {
  const teacherId = await getAuthenticatedTeacher()
  
  try {
    const templateId = `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const generatedSlots = generateTimeSlots(data.startTime, data.endTime, data.duration)
    const slotsToCreate = []
    let conflictCount = 0
    
    // Genera slot per ogni giorno selezionato nel range di date
    const currentDate = new Date(data.startDate)
    const endDate = new Date(data.endDate)
    
    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay()
      
      if (data.weekDays.includes(dayOfWeek)) {
        for (const slot of generatedSlots) {
          // CORREZIONE: Normalizza la data per ogni controllo
          const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate())
          
          // Controlla se esiste già uno slot in quel momento
          const existingSlot = await prisma.timeSlot.findFirst({
            where: {
              teacherId,
              date: targetDate,
              OR: [
                { startTime: slot.startTime },
                {
                  AND: [
                    { startTime: { lt: slot.endTime } },
                    { endTime: { gt: slot.startTime } }
                  ]
                }
              ]
            }
          })
          
          if (!existingSlot) {
            slotsToCreate.push({
              teacherId,
              date: targetDate,
              startTime: slot.startTime,
              endTime: slot.endTime,
              duration: data.duration,
              source: "TEMPLATE" as const,
              templateId,
              isActive: true
            })
          } else {
            conflictCount++
          }
        }
      }
      
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    if (slotsToCreate.length === 0) {
      const message = conflictCount > 0 
        ? `Nessun nuovo slot creato. ${conflictCount} slot erano già presenti negli orari richiesti.`
        : "Nessun slot da creare per i parametri specificati."
      return { success: false, error: message }
    }
    
    // CORREZIONE: Gestisci errori durante la creazione batch
    let createdCount = 0
    try {
      const result = await prisma.timeSlot.createMany({
        data: slotsToCreate,
        skipDuplicates: true // Evita errori per duplicati
      })
      createdCount = result.count
    } catch (createError) {
      console.error("Error during batch creation:", createError)
      return { success: false, error: "Errore durante la creazione batch degli slot" }
    }
    
    revalidatePath("/teacher/calendar")
    
    const message = conflictCount > 0 
      ? `Template "${data.name}" creato! Aggiunti ${createdCount} time slots. ${conflictCount} slot saltati perché già presenti.`
      : `Template "${data.name}" creato! Aggiunti ${createdCount} time slots.`
    
    return { 
      success: true, 
      data: { 
        templateId,
        count: createdCount,
        conflictCount,
        message
      }
    }
  } catch (error) {
    console.error("Error creating template time slots:", error)
    return { success: false, error: "Errore nella creazione del template" }
  }
}

// === UPDATE OPERATIONS ===

export async function toggleTimeSlotActive(timeSlotId: number) {
  const teacherId = await getAuthenticatedTeacher()
  
  try {
    // Verifica che lo slot appartenga al teacher
    const timeSlot = await prisma.timeSlot.findFirst({
      where: {
        id: timeSlotId,
        teacherId
      },
      include: {
        bookings: {
          where: {
            status: {
              not: "CANCELLED"
            }
          }
        }
      }
    })
    
    if (!timeSlot) {
      return { success: false, error: "Time slot non trovato" }
    }
    
    // Se ha prenotazioni attive e si sta tentando di disattivare
    if (timeSlot.bookings.length > 0 && timeSlot.isActive) {
      return { success: false, error: "Non puoi disattivare uno slot con prenotazioni attive" }
    }
    
    const updatedSlot = await prisma.timeSlot.update({
      where: { id: timeSlotId },
      data: { 
        isActive: !timeSlot.isActive,
        updatedAt: new Date()
      },
      include: {
        bookings: {
          where: {
            status: {
              not: "CANCELLED"
            }
          },
          include: {
            student: {
              select: {
                id: true,
                username: true,
                email: true
              }
            }
          }
        }
      }
    })
    
    revalidatePath("/teacher/calendar")
    return { success: true, data: updatedSlot }
  } catch (error) {
    console.error("Error toggling time slot:", error)
    return { success: false, error: "Errore nell'aggiornamento dello slot" }
  }
}

export async function updateTimeSlot(timeSlotId: number, data: Partial<CreateManualSlotData>) {
  const teacherId = await getAuthenticatedTeacher()
  
  try {
    // Verifica che lo slot appartenga al teacher
    const existingSlot = await prisma.timeSlot.findFirst({
      where: {
        id: timeSlotId,
        teacherId
      },
      include: {
        bookings: {
          where: {
            status: {
              not: "CANCELLED"
            }
          }
        }
      }
    })
    
    if (!existingSlot) {
      return { success: false, error: "Time slot non trovato" }
    }
    
    if (existingSlot.bookings.length > 0) {
      return { success: false, error: "Non puoi modificare uno slot con prenotazioni attive" }
    }
    
    const updateData: any = { updatedAt: new Date() }
    
    if (data.startTime && data.duration) {
      updateData.startTime = data.startTime
      updateData.endTime = calculateEndTime(data.startTime, data.duration)
      updateData.duration = data.duration
    } else if (data.startTime) {
      updateData.startTime = data.startTime
      updateData.endTime = calculateEndTime(data.startTime, existingSlot.duration)
    } else if (data.duration) {
      updateData.duration = data.duration
      updateData.endTime = calculateEndTime(existingSlot.startTime, data.duration)
    }
    
    if (data.date) {
      // CORREZIONE: Normalizza la data
      updateData.date = new Date(data.date.getFullYear(), data.date.getMonth(), data.date.getDate())
    }
    
    const updatedSlot = await prisma.timeSlot.update({
      where: { id: timeSlotId },
      data: updateData,
      include: {
        bookings: {
          where: {
            status: {
              not: "CANCELLED"
            }
          },
          include: {
            student: {
              select: {
                id: true,
                username: true,
                email: true
              }
            }
          }
        }
      }
    })
    
    revalidatePath("/teacher/calendar")
    return { success: true, data: updatedSlot }
  } catch (error) {
    console.error("Error updating time slot:", error)
    return { success: false, error: "Errore nell'aggiornamento dello slot" }
  }
}

// === DELETE OPERATIONS ===

export async function deleteTimeSlot(timeSlotId: number) {
  const teacherId = await getAuthenticatedTeacher()
  
  try {
    // Verifica che lo slot appartenga al teacher
    const timeSlot = await prisma.timeSlot.findFirst({
      where: {
        id: timeSlotId,
        teacherId
      },
      include: {
        bookings: {
          where: {
            status: {
              not: "CANCELLED"
            }
          }
        }
      }
    })
    
    if (!timeSlot) {
      return { success: false, error: "Time slot non trovato" }
    }
    
    if (timeSlot.bookings.length > 0) {
      return { success: false, error: "Non puoi eliminare uno slot con prenotazioni attive" }
    }
    
    await prisma.timeSlot.delete({
      where: { id: timeSlotId }
    })
    
    revalidatePath("/teacher/calendar")
    return { success: true, message: "Time slot eliminato con successo" }
  } catch (error) {
    console.error("Error deleting time slot:", error)
    return { success: false, error: "Errore nell'eliminazione dello slot" }
  }
}

export async function deleteTemplate(templateId: string) {
  const teacherId = await getAuthenticatedTeacher()
  
  try {
    // Trova tutti gli slot del template
    const templateSlots = await prisma.timeSlot.findMany({
      where: {
        teacherId,
        templateId,
        source: "TEMPLATE"
      },
      include: {
        bookings: {
          where: {
            status: {
              not: "CANCELLED"
            }
          }
        }
      }
    })
    
    if (templateSlots.length === 0) {
      return { success: false, error: "Template non trovato" }
    }
    
    // Controlla se ci sono prenotazioni attive
    const slotsWithBookings = templateSlots.filter(slot => slot.bookings.length > 0)
    
    if (slotsWithBookings.length > 0) {
      return { 
        success: false, 
        error: `Non puoi eliminare il template: ${slotsWithBookings.length} slot hanno prenotazioni attive` 
      }
    }
    
    // Elimina tutti gli slot del template
    const deletedCount = await prisma.timeSlot.deleteMany({
      where: {
        teacherId,
        templateId,
        source: "TEMPLATE"
      }
    })
    
    revalidatePath("/teacher/calendar")
    return { 
      success: true, 
      message: `Template eliminato con successo. Rimossi ${deletedCount.count} time slots.` 
    }
  } catch (error) {
    console.error("Error deleting template:", error)
    return { success: false, error: "Errore nell'eliminazione del template" }
  }
}

export async function deleteMultipleTimeSlots(timeSlotIds: number[]) {
  const teacherId = await getAuthenticatedTeacher()
  
  try {
    // Verifica che tutti gli slot appartengano al teacher e non abbiano prenotazioni
    const timeSlots = await prisma.timeSlot.findMany({
      where: {
        id: { in: timeSlotIds },
        teacherId
      },
      include: {
        bookings: {
          where: {
            status: {
              not: "CANCELLED"
            }
          }
        }
      }
    })
    
    if (timeSlots.length !== timeSlotIds.length) {
      return { success: false, error: "Alcuni time slot non sono stati trovati" }
    }
    
    const slotsWithBookings = timeSlots.filter(slot => slot.bookings.length > 0)
    
    if (slotsWithBookings.length > 0) {
      return { 
        success: false, 
        error: `Non puoi eliminare ${slotsWithBookings.length} slot che hanno prenotazioni attive` 
      }
    }
    
    const deletedCount = await prisma.timeSlot.deleteMany({
      where: {
        id: { in: timeSlotIds },
        teacherId
      }
    })
    
    revalidatePath("/teacher/calendar")
    return { 
      success: true, 
      message: `Eliminati ${deletedCount.count} time slots con successo` 
    }
  } catch (error) {
    console.error("Error deleting multiple time slots:", error)
    return { success: false, error: "Errore nell'eliminazione multipla degli slot" }
  }
}