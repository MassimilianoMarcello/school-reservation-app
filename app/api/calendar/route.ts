// app/api/calendar/slots/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const teacherId = searchParams.get('teacherId')
    const year = searchParams.get('year')
    const month = searchParams.get('month')

    if (!teacherId || !year || !month) {
      return NextResponse.json(
        { error: 'teacherId, year e month sono richiesti' },
        { status: 400 }
      )
    }

    // Crea le date di inizio e fine mese
    const monthDate = new Date(parseInt(year), parseInt(month) - 1, 1)
    const startDate = startOfMonth(monthDate)
    const endDate = endOfMonth(monthDate)

    // Query per ottenere tutti i TimeSlot del mese con le relative prenotazioni
    const timeSlots = await prisma.timeSlot.findMany({
      where: {
        teacherId,
        date: {
          gte: startDate,
          lte: endDate
        },
        isActive: true
      },
      include: {
        bookings: {
          where: {
            status: {
              not: 'CANCELLED'
            }
          }
        }
      },
      orderBy: [
        { date: 'asc' },
        { startTime: 'asc' }
      ]
    })

    // Raggruppa per data e conta slot disponibili/totali
    const slotsByDate = new Map<string, { total: number; booked: number }>()

    timeSlots.forEach(slot => {
      const dateStr = format(slot.date, 'yyyy-MM-dd')
      
      if (!slotsByDate.has(dateStr)) {
        slotsByDate.set(dateStr, { total: 0, booked: 0 })
      }
      
      const dayStats = slotsByDate.get(dateStr)!
      dayStats.total += 1
      
      // Se lo slot ha una prenotazione attiva, contalo come occupato
      if (slot.bookings.length > 0) {
        dayStats.booked += 1
      }
    })

    // Crea array di risultati per tutti i giorni del mese
    const allDaysInMonth = eachDayOfInterval({ start: startDate, end: endDate })
    
    const result = allDaysInMonth.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd')
      const dayStats = slotsByDate.get(dateStr) || { total: 0, booked: 0 }
      
      return {
        date: dateStr,
        totalSlots: dayStats.total,
        availableSlots: dayStats.total - dayStats.booked,
        bookedSlots: dayStats.booked
      }
    })

    return NextResponse.json({
      success: true,
      data: result,
      meta: {
        teacherId,
        year: parseInt(year),
        month: parseInt(month),
        totalDays: result.length,
        daysWithSlots: result.filter(day => day.totalSlots > 0).length
      }
    })

  } catch (error) {
    console.error('Errore nel recupero slot calendario:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}

// Interfacce per il tipo di risposta
export interface DaySlotCount {
  date: string
  availableSlots: number
  totalSlots: number
  bookedSlots: number
}

export interface CalendarSlotsResponse {
  success: boolean
  data: DaySlotCount[]
  meta: {
    teacherId: string
    year: number
    month: number
    totalDays: number
    daysWithSlots: number
  }
}