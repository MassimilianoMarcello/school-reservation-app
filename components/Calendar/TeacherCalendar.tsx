"use client";
import * as React from "react";
import { type DateRange } from "react-day-picker";

import { Tabs, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";

// Import dei componenti estratti
import { TimeSlotManager, type TimeSlot } from "./TimeSlotManger";
import { ExistingTimeSlots } from "./ExistingTimeSlots";
import { DateSelectionManager } from "./DateSelectionManager";
import { TeacherAvailabilityHeader } from "./TeacherAvailabilityHeader";
import { ModeSelector } from "./ModeSelector";

// Import delle server actions
import {
  getTeacherTimeSlotsForDate,
  getTeacherMonthAvailability,
  createManualTimeSlot,
  createTemplateTimeSlots,
  deleteTimeSlot,
  toggleTimeSlotActive,
  type TimeSlotWithBookings,
  type CreateManualSlotData,
  type CreateTemplateData,
  type MonthAvailabilityData,
} from "@/hooks/use-toast";

export default function TeacherAvailabilityScheduler() {
  const [mode, setMode] = React.useState<"single" | "range">("single");
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date());
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>();
  const [selectedDays, setSelectedDays] = React.useState<number[]>([]);
  const [timeSlots, setTimeSlots] = React.useState<TimeSlot[]>([]);
  const [templateName, setTemplateName] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  
  // Set to track days with availability
  const [monthAvailabilityCache, setMonthAvailabilityCache] = React.useState<Map<string, MonthAvailabilityData>>(new Map());
  const [isLoadingAvailability, setIsLoadingAvailability] = React.useState(false);
  const [loadedMonths, setLoadedMonths] = React.useState<Set<string>>(new Set());

  // Existing time slots for display
  const [existingTimeSlots, setExistingTimeSlots] = React.useState<TimeSlotWithBookings[]>([]);

  // Funzione per ottenere la chiave del mese
  const getMonthKey = React.useCallback((date: Date): string => {
    return `${date.getFullYear()}-${date.getMonth()}`;
  }, []);

  // Funzione per caricare i giorni con disponibilità per il mese visualizzato
  const loadMonthAvailability = React.useCallback(async (month: Date) => {
    const monthKey = getMonthKey(month);
    
    if (monthAvailabilityCache.has(monthKey) || loadedMonths.has(monthKey) || isLoadingAvailability) {
      return;
    }

    try {
      setIsLoadingAvailability(true);
      setLoadedMonths(prev => new Set(prev).add(monthKey));
      
      const result = await getTeacherMonthAvailability(month.getFullYear(), month.getMonth());
      
      if (result.success && result.data) {
        setMonthAvailabilityCache(prev => new Map(prev).set(monthKey, result.data!));
      }
      
    } catch (error) {
      console.error('Errore nel caricamento delle disponibilità del mese:', error);
      setLoadedMonths(prev => {
        const newSet = new Set(prev);
        newSet.delete(monthKey);
        return newSet;
      });
    } finally {
      setIsLoadingAvailability(false);
    }
  }, [monthAvailabilityCache, isLoadingAvailability, loadedMonths, getMonthKey]);

  // Funzione per caricare gli slot di una data specifica
  const loadTimeSlots = React.useCallback(async (date: Date) => {
    try {
      setLoading(true);
      const result = await getTeacherTimeSlotsForDate(date);

      if (result.success && result.data) {
        setExistingTimeSlots(
          result.data.map((slot) => ({
            ...slot,
            bookings: slot.bookings.map((booking) => ({
              ...booking,
              student: {
                ...booking.student,
                email: booking.student.email ?? "",
              },
            })),
          }))
        );
      } else {
        toast("Errore nel caricamento dello slot");
      }
    } catch {
      toast("Errore nel caricamento dei time slots");
    } finally {
      setLoading(false);
    }
  }, []);

  // Funzione per ricaricare sia gli slot che le disponibilità del mese
  const refreshData = React.useCallback(async (date: Date) => {
    const monthKey = getMonthKey(date);
    setMonthAvailabilityCache(prev => {
      const newMap = new Map(prev);
      newMap.delete(monthKey);
      return newMap;
    });
    
    await Promise.all([
      loadTimeSlots(date),
      loadMonthAvailability(date)
    ]);
  }, [loadTimeSlots, loadMonthAvailability, getMonthKey]);

  // Funzione per verificare se un giorno ha disponibilità
  const hasAvailability = React.useCallback((date: Date): boolean => {
    const monthKey = getMonthKey(date);
    const monthData = monthAvailabilityCache.get(monthKey);
    
    if (!monthData) return false;
    
    const dateString = date.toISOString().split('T')[0];
    return monthData.daysWithAvailability.includes(dateString);
  }, [monthAvailabilityCache, getMonthKey]);

  // Load existing time slots when single date changes
  React.useEffect(() => {
    if (mode === "single" && selectedDate) {
      loadTimeSlots(selectedDate);
    }
  }, [selectedDate, mode, loadTimeSlots]);

  // Load availability for current month on mount
  React.useEffect(() => {
    if (selectedDate) {
      loadMonthAvailability(selectedDate);
    }
  }, [selectedDate, loadMonthAvailability]);

  // Calcola il numero di giorni tra due date, inclusi entrambi i giorni
  const getDateRangeDays = (dateRange: DateRange | undefined): number => {
    if (!dateRange?.from || !dateRange?.to) return 0;
    const timeDiff = dateRange.to.getTime() - dateRange.from.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
  };

  const handleCreateSingleAvailability = async () => {
    if (!selectedDate || timeSlots.length === 0) return;

    try {
      setLoading(true);
      
      for (const slot of timeSlots) {
        const data: CreateManualSlotData = {
          date: selectedDate,
          startTime: slot.startTime,
          duration: slot.duration,
        };

        const result = await createManualTimeSlot(data);
        
        if (!result.success) {
          toast(`Errore nella creazione del time slot ${slot.startTime}`);
          return;
        }
      }

      toast("Disponibilità create con successo!");
      setTimeSlots([]);
      await refreshData(selectedDate);
      
    } catch {
      toast("Errore nella creazione delle disponibilità");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplateAvailability = async () => {
    const rangeDays = getDateRangeDays(dateRange);
    
    if (!dateRange?.from || !dateRange?.to || selectedDays.length === 0 || timeSlots.length === 0 || !templateName.trim()) {
      toast("Compila tutti i campi richiesti!");
      return;
    }

    if (rangeDays < 7) {
      toast("Il periodo deve essere di almeno 7 giorni per garantire la presenza di tutti i giorni della settimana selezionati!");
      return;
    }

    try {
      setLoading(true);
      
      for (const slot of timeSlots) {
        const data: CreateTemplateData = {
          name: `${templateName} - ${slot.startTime}`,
          weekDays: selectedDays,
          startTime: slot.startTime,
          endTime: slot.endTime,
          duration: slot.duration,
          startDate: dateRange.from,
          endDate: dateRange.to,
        };

        const result = await createTemplateTimeSlots(data);
        
        if (!result.success) {
          toast(`Errore nella creazione del template per ${slot.startTime}`);
          return;
        }
      }

      toast("Template creato con successo!");
      setTimeSlots([]);
      setTemplateName("");
      setSelectedDays([]);
      setDateRange(undefined);
      
      // Invalida la cache per tutti i mesi nel range per mostrare le nuove disponibilità
      setLoadedMonths(new Set());
      setMonthAvailabilityCache(new Map());
      
    } catch (error) {
      toast(
        error instanceof Error
          ? error.message
          : "Errore nella creazione del template"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTimeSlot = async (timeSlotId: number) => {
    const timeSlot = existingTimeSlots.find((slot) => slot.id === timeSlotId);
    const booking = timeSlot ? timeSlot.bookings.find((booking) => booking.status !== "CANCELLED") : null;

    if (
      booking &&
      !confirm(
        "Questo slot ha una prenotazione attiva. Vuoi davvero eliminarlo?"
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      const result = await deleteTimeSlot(timeSlotId);

      if (result.success) {
        toast(result.message || "Time slot eliminato con successo");
        if (selectedDate) {
          await refreshData(selectedDate);
        }
      } else {
        toast(result.error || "Errore nell'eliminazione del time slot");
      }
    } catch (error) {
      toast(
        error instanceof Error
          ? error.message
          : "Errore nell'eliminazione del time slot"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSlotActive = async (timeSlotId: number) => {
    try {
      setLoading(true);
      const result = await toggleTimeSlotActive(timeSlotId);

      if (result.success) {
        if (selectedDate) {
          await refreshData(selectedDate);
        }
      } else {
        toast(result.error || "Errore nel toggle del time slot");
      }
    } catch (error) {
      toast(
        error instanceof Error
          ? error.message
          : "Errore nel toggle del time slot"
      );
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    if (mode === "single") {
      return selectedDate && timeSlots.length > 0;
    } else {
      const rangeDays = getDateRangeDays(dateRange);
      return (
        dateRange?.from && 
        dateRange?.to && 
        rangeDays >= 7 &&
        selectedDays.length > 0 && 
        timeSlots.length > 0 && 
        templateName.trim()
      );
    }
  };

  // Gestione del cambio mese nel calendario
  const handleMonthChange = React.useCallback((month: Date) => {
    loadMonthAvailability(month);
  }, [loadMonthAvailability]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header Component */}
      <TeacherAvailabilityHeader />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Mode Selection Component */}
        <ModeSelector mode={mode} onModeChange={setMode} />

        {/* Tab Content */}
        <Tabs value={mode} onValueChange={(v) => setMode(v as "single" | "range")}>
          <TabsContent value="single" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Date Selection Component */}
              <DateSelectionManager
                mode="single"
                selectedDate={selectedDate}
                onSelectedDateChange={setSelectedDate}
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
                selectedDays={selectedDays}
                onSelectedDaysChange={setSelectedDays}
                templateName={templateName}
                onTemplateNameChange={setTemplateName}
                hasAvailability={hasAvailability}
                onMonthChange={handleMonthChange}
              />

              {/* Existing Slots Component */}
              <ExistingTimeSlots
                timeSlots={existingTimeSlots}
                selectedDate={selectedDate}
                loading={loading}
                onToggleSlotActive={handleToggleSlotActive}
                onDeleteTimeSlot={handleDeleteTimeSlot}
              />
            </div>
          </TabsContent>

          <TabsContent value="range" className="space-y-6 mt-6">
            {/* Date Selection Component for Range Mode */}
            <DateSelectionManager
              mode="range"
              selectedDate={selectedDate}
              onSelectedDateChange={setSelectedDate}
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              selectedDays={selectedDays}
              onSelectedDaysChange={setSelectedDays}
              templateName={templateName}
              onTemplateNameChange={setTemplateName}
              hasAvailability={hasAvailability}
              onMonthChange={handleMonthChange}
            />
          </TabsContent>
        </Tabs>

        {/* Time Slots Management */}
        <TimeSlotManager
          timeSlots={timeSlots}
          onTimeSlotsChange={setTimeSlots}
          onSubmit={mode === "single" ? handleCreateSingleAvailability : handleCreateTemplateAvailability}
          submitLabel={mode === "single" ? "Crea Disponibilità" : "Crea Template"}
          canSubmit={!!canProceed()}
          isLoading={loading}
          className="mb-8"
        />
      </div>
    </div>
  );
}
