// hooks/useCalendarSlots.ts
import { useState, useEffect } from 'react'

interface DaySlotCount {
  date: string
  availableSlots: number
  totalSlots: number
  bookedSlots: number
}

interface CalendarSlotsResponse {
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

export function useCalendarSlots(teacherId: string, year: number, month: number) {
  const [data, setData] = useState<DaySlotCount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!teacherId) return

    const fetchSlots = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(
          `/api/calendar/slots?teacherId=${teacherId}&year=${year}&month=${month}`
        )

        if (!response.ok) {
          throw new Error('Errore nel caricamento dei dati')
        }

        const result: CalendarSlotsResponse = await response.json()
        
        if (result.success) {
          setData(result.data)
        } else {
          throw new Error('Risposta API non valida')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Errore sconosciuto')
      } finally {
        setLoading(false)
      }
    }

    fetchSlots()
  }, [teacherId, year, month])

  const refetch = () => {
    if (teacherId) {
      const fetchSlots = async () => {
        try {
          setLoading(true)
          setError(null)

          const response = await fetch(
            `/api/calendar/slots?teacherId=${teacherId}&year=${year}&month=${month}`
          )

          if (!response.ok) {
            throw new Error('Errore nel caricamento dei dati')
          }

          const result: CalendarSlotsResponse = await response.json()
          
          if (result.success) {
            setData(result.data)
          } else {
            throw new Error('Risposta API non valida')
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Errore sconosciuto')
        } finally {
          setLoading(false)
        }
      }

      fetchSlots()
    }
  }

  return { 
    data, 
    loading, 
    error, 
    refetch 
  }
}