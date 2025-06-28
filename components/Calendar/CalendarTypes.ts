// Types basati sul tuo schema Prisma
export interface TimeSlot {
  id: number
  teacherId: string
  date: Date
  startTime: string
  endTime: string
  duration: number
  isActive: boolean
  source: 'MANUAL' | 'TEMPLATE'
  templateId: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Booking {
  id: number
  studentId: string
  timeSlotId: number
  status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW'
  student: {
    username: string | null
    email: string | null
  }
}

export interface TemplateData {
  name: string
  weekDays: number[] // 0=domenica, 1=lunedì, etc.
  startTime: string
  endTime: string
  duration: number
  startDate: Date
  endDate: Date
}