"use client";
import * as React from "react";
import { type DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Clock,
  Check,
  X,
  Calendar as CalendarIcon,
  Users,
  Repeat,
  Edit,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

// Import del nuovo componente TimeSlotManager
import { TimeSlotManager, type TimeSlot } from "./TimeSlotManger";

// Import delle server actions (mantieni le tue esistenti)
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

const weekDays = [
  { value: 0, label: "Domenica" },
  { value: 1, label: "Lunedì" },
  { value: 2, label: "Martedì" },
  { value: 3, label: "Mercoledì" },
  { value: 4, label: "Giovedì" },
  { value: 5, label: "Venerdì" },
  { value: 6, label: "Sabato" },
];

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

  const toggleDay = (dayValue: number) => {
    setSelectedDays(prev => 
      prev.includes(dayValue) 
        ? prev.filter(val => val !== dayValue)
        : [...prev, dayValue]
    );
  };

  // Questa funzione calcola il numero di giorni tra due date, inclusi entrambi i giorni
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
    const booking = timeSlot ? getBookingForTimeSlot(timeSlot) : null;

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

  const getBookingForTimeSlot = (timeSlot: TimeSlotWithBookings) => {
    return timeSlot.bookings.find((booking) => booking.status !== "CANCELLED");
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

  const availableCount = existingTimeSlots.filter(
    (slot) => slot.isActive && !getBookingForTimeSlot(slot)
  ).length;

  const bookedCount = existingTimeSlots.filter((slot) =>
    getBookingForTimeSlot(slot)
  ).length;

  // Gestione del cambio mese nel calendario
  const handleMonthChange = React.useCallback((month: Date) => {
    loadMonthAvailability(month);
  }, [loadMonthAvailability]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CalendarIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Gestione Disponibilità Lezioni
              </h1>
              <p className="text-sm text-gray-600">
                Crea le tue disponibilità per singole date o con template ricorrenti
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Mode Selection */}
        <div className="mb-8">
          <Tabs value={mode} onValueChange={(v) => setMode(v as "single" | "range")}>
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="single" className="flex items-center gap-2">
                <Edit className="w-4 h-4" />
                Singola Data
              </TabsTrigger>
              <TabsTrigger value="range" className="flex items-center gap-2">
                <Repeat className="w-4 h-4" />
                Template Ricorrente
              </TabsTrigger>
            </TabsList>

            <TabsContent value="single" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Calendar Selection */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CalendarIcon className="w-5 h-5 text-blue-600" />
                      Seleziona Data
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      defaultMonth={selectedDate}
                      numberOfMonths={2}
                      className="rounded-lg border shadow-sm"
                      disabled={(date) => date < new Date()}
                      showOutsideDays={false}
                      modifiers={{
                        hasAvailability: (date) => hasAvailability(date)
                      }}
                      modifiersStyles={{
                        hasAvailability: {
                          backgroundColor: '#dcfce7', // bg-green-100
                          color: '#166534', // text-green-800
                          fontWeight: '500'
                        }
                      }}
                      onMonthChange={handleMonthChange}
                    />
                  </CardContent>
                </Card>

                {/* Existing Slots */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-blue-600" />
                      Slot Esistenti
                    </CardTitle>
                    {selectedDate && (
                      <div className="flex gap-2 text-sm">
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          <CalendarIcon className="w-3 h-3 mr-1" />
                          {availableCount} liberi
                        </Badge>
                        <Badge variant="destructive">
                          <Users className="w-3 h-3 mr-1" />
                          {bookedCount} prenotati
                        </Badge>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="max-h-96 overflow-y-auto">
                    {loading ? (
                      <div className="text-center py-8">
                        <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin" />
                        <p className="text-sm text-muted-foreground">Caricamento...</p>
                      </div>
                    ) : existingTimeSlots.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <CalendarIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Nessuna disponibilità</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {existingTimeSlots
                          .sort((a, b) => a.startTime.localeCompare(b.startTime))
                          .map((slot) => {
                            const booking = getBookingForTimeSlot(slot);
                            const isBooked = !!booking;

                            return (
                              <div key={slot.id} className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant={
                                      isBooked
                                        ? "destructive"
                                        : slot.isActive
                                          ? "default"
                                          : "outline"
                                    }
                                    className="flex-1 justify-between shadow-none"
                                    onClick={() =>
                                      !isBooked && handleToggleSlotActive(slot.id)
                                    }
                                    disabled={isBooked || loading}
                                  >
                                    <span className="flex items-center gap-2">
                                      {slot.startTime} - {slot.endTime}
                                      {slot.source === "TEMPLATE" && (
                                        <Repeat className="w-3 h-3 opacity-60" />
                                      )}
                                    </span>
                                    <div className="flex items-center gap-1">
                                      <span className="text-xs opacity-70">
                                        {slot.duration}min
                                      </span>
                                      {isBooked ? (
                                        <X className="w-4 h-4" />
                                      ) : slot.isActive ? (
                                        <Check className="w-4 h-4" />
                                      ) : (
                                        <X className="w-4 h-4 opacity-50" />
                                      )}
                                    </div>
                                  </Button>

                                  {!isBooked && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleDeleteTimeSlot(slot.id)}
                                      className="px-2 hover:bg-red-50"
                                      disabled={loading}
                                    >
                                      <X className="w-4 h-4" />
                                    </Button>
                                  )}
                                </div>

                                {booking && (
                                  <div className="ml-2 p-2 bg-red-50 rounded text-xs">
                                    <div className="font-medium text-red-800">
                                      {booking.student.username || booking.student.email}
                                    </div>
                                    <div className="text-red-600">{booking.status}</div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="range" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Calendar Range Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CalendarIcon className="w-5 h-5 text-blue-600" />
                      Seleziona Periodo
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Calendar
                      mode="range"
                      defaultMonth={dateRange?.from}
                      selected={dateRange}
                      onSelect={setDateRange}
                      numberOfMonths={2}
                      className="rounded-lg border shadow-sm"
                      disabled={(date) => date < new Date()}
                      showOutsideDays={false} 
                      onMonthChange={handleMonthChange}
                    />
                  </CardContent>
                </Card>

                {/* Template Configuration */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Repeat className="w-5 h-5 text-blue-600" />
                      Configurazione Template
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Nome Template</Label>
                      <Input
                        value={templateName}
                        onChange={(e) => setTemplateName(e.target.value)}
                        placeholder="es. Lezioni pomeridiane"
                      />
                    </div>

                    <div>
                      <Label>Giorni della settimana</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {weekDays.map((day) => (
                          <div key={day.value} className="flex items-center space-x-2">
                            <Checkbox
                              id={`day-${day.value}`}
                              checked={selectedDays.includes(day.value)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  toggleDay(day.value);
                                } else {
                                  toggleDay(day.value);
                                }
                              }}
                            />
                            <Label htmlFor={`day-${day.value}`} className="text-sm">
                              {day.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                      <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg mt-2">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          <span className="font-medium">Periodo minimo richiesto</span>
                        </div>
                        <p className="mt-1">
                          Seleziona almeno 7 giorni per garantire che tutti i giorni della settimana scelti siano presenti nel periodo.
                          {dateRange?.from && dateRange?.to && (
                            <span className="block mt-1 font-medium">
                              Periodo attuale: {getDateRangeDays(dateRange)} giorni
                              {getDateRangeDays(dateRange) < 7 && (
                                <span className="text-red-600"> (troppo breve)</span>
                              )}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>

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
