"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Check, Calendar, User, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  duration: number;
}

export interface ExistingTimeSlot {
  id: number;
  startTime: string;
  endTime: string;
  duration: number;
  isActive: boolean;
  bookings: Array<{
    id: number;
    status: string;
    student: {
      id: string;
      username: string | null;
      email: string | null;
    };
  }>;
}

interface TimeSlotGridProps {
  selectedSlots: TimeSlot[];
  existingSlots: ExistingTimeSlot[];
  onSlotsChange: (slots: TimeSlot[]) => void;
  onSubmit?: () => void;
  submitLabel?: string;
  canSubmit?: boolean;
  isLoading?: boolean;
  className?: string;
  selectedDate?: Date;
}

export function TimeSlotGrid({
  selectedSlots,
  existingSlots,
  onSlotsChange,
  onSubmit,
  submitLabel = "Salva Disponibilità",
  canSubmit = true,
  isLoading = false,
  className = "",
  selectedDate
}: TimeSlotGridProps) {

  // Genera tutti gli slot possibili (24 ore x 2 slot da 30 min = 48 slot)
  const generateAllTimeSlots = React.useMemo(() => {
    const slots = [];
    for (let hour = 6; hour < 24; hour++) { // Start from 6 AM for better UX
      for (let minute = 0; minute < 60; minute += 30) {
        const startTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const endHour = minute === 30 ? hour + 1 : hour;
        const endMinute = minute === 30 ? 0 : 30;
        const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
        
        slots.push({
          startTime,
          endTime,
          duration: 30
        });
      }
    }
    return slots;
  }, []);

  // Determina lo stato di ogni slot
  const getSlotState = React.useCallback((startTime: string, endTime: string) => {
    const existingSlot = existingSlots.find(slot => 
      slot.startTime === startTime && slot.endTime === endTime
    );
    
    if (existingSlot) {
      const hasActiveBooking = existingSlot.bookings.some(booking => 
        booking.status !== 'CANCELLED'
      );
      
      if (hasActiveBooking) {
        return 'booked';
      } else if (existingSlot.isActive) {
        return 'saved';
      } else {
        return 'inactive';
      }
    }
    
    const isSelected = selectedSlots.some(slot => 
      slot.startTime === startTime && slot.endTime === endTime
    );
    
    return isSelected ? 'selected' : 'available';
  }, [existingSlots, selectedSlots]);

  // Gestisce il click su uno slot
  const handleSlotClick = React.useCallback((startTime: string, endTime: string) => {
    const slotState = getSlotState(startTime, endTime);
    
    if (slotState === 'saved' || slotState === 'booked' || slotState === 'inactive') {
      return;
    }
    
    if (slotState === 'selected') {
      const newSlots = selectedSlots.filter(slot => 
        !(slot.startTime === startTime && slot.endTime === endTime)
      );
      onSlotsChange(newSlots);
    } else {
      const newSlot: TimeSlot = {
        id: `${startTime}-${endTime}`,
        startTime,
        endTime,
        duration: 30
      };
      onSlotsChange([...selectedSlots, newSlot]);
    }
  }, [selectedSlots, onSlotsChange, getSlotState]);

  // Stili per ogni stato - Completamente rinnovati
  const getSlotStyles = (state: string) => {
    const baseStyles = "relative group h-16 border-2 rounded-xl cursor-pointer transition-all duration-300 flex flex-col items-center justify-center text-sm font-semibold shadow-sm hover:shadow-lg transform hover:scale-105 min-w-[120px]";
    
    switch (state) {
      case 'available':
        return cn(baseStyles, "bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200 text-slate-700 hover:from-slate-100 hover:to-slate-200 hover:border-slate-300");
      case 'selected':
        return cn(baseStyles, "bg-gradient-to-br from-blue-500 to-blue-600 border-blue-400 text-white hover:from-blue-600 hover:to-blue-700 shadow-blue-200");
      case 'saved':
        return cn(baseStyles, "bg-gradient-to-br from-emerald-500 to-emerald-600 border-emerald-400 text-white cursor-not-allowed shadow-emerald-200");
      case 'booked':
        return cn(baseStyles, "bg-gradient-to-br from-rose-500 to-rose-600 border-rose-400 text-white cursor-not-allowed shadow-rose-200");
      case 'inactive':
        return cn(baseStyles, "bg-gradient-to-br from-gray-300 to-gray-400 border-gray-300 text-gray-600 cursor-not-allowed opacity-60");
      default:
        return baseStyles;
    }
  };

  // Raggruppa gli slot per ora
  const slotsByHour = React.useMemo(() => {
    const groups: Array<{hour: number, slots: Array<{startTime: string, endTime: string, duration: number}>}> = [];
    
    for (let hour = 6; hour < 24; hour++) {
      const hourSlots = generateAllTimeSlots.filter(slot => 
        parseInt(slot.startTime.split(':')[0]) === hour
      );
      if (hourSlots.length > 0) {
        groups.push({ hour, slots: hourSlots });
      }
    }
    
    return groups;
  }, [generateAllTimeSlots]);

  const getBookingInfo = (startTime: string, endTime: string) => {
    const existingSlot = existingSlots.find(slot => 
      slot.startTime === startTime && slot.endTime === endTime
    );
    
    if (existingSlot && existingSlot.bookings.length > 0) {
      const activeBooking = existingSlot.bookings.find(booking => 
        booking.status !== 'CANCELLED'
      );
      return activeBooking;
    }
    return null;
  };

  const clearSelection = () => {
    onSlotsChange([]);
  };

  return (
    <div className={cn("w-full max-w-7xl mx-auto", className)}>
      {/* Header Card */}
      <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3 text-2xl font-bold text-gray-800">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              Gestione Orari
              {selectedDate && (
                <Badge variant="outline" className="ml-3 px-3 py-1 bg-white border-blue-200 text-blue-700">
                  <Calendar className="w-4 h-4 mr-2" />
                  {selectedDate.toLocaleDateString('it-IT', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </Badge>
              )}
            </CardTitle>
          </div>
          
          {/* Legend */}
          <div className="flex flex-wrap items-center gap-6 mt-4 p-4 bg-white rounded-lg border border-blue-100">
            <div className="flex items-center gap-2 text-sm font-medium">
              <div className="w-4 h-4 bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200 rounded-md"></div>
              <span className="text-gray-700">Disponibile</span>
            </div>
            <div className="flex items-center gap-2 text-sm font-medium">
              <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-blue-600 border-2 border-blue-400 rounded-md"></div>
              <span className="text-gray-700">Selezionato</span>
            </div>
            <div className="flex items-center gap-2 text-sm font-medium">
              <div className="w-4 h-4 bg-gradient-to-br from-emerald-500 to-emerald-600 border-2 border-emerald-400 rounded-md"></div>
              <span className="text-gray-700">Salvato</span>
            </div>
            <div className="flex items-center gap-2 text-sm font-medium">
              <div className="w-4 h-4 bg-gradient-to-br from-rose-500 to-rose-600 border-2 border-rose-400 rounded-md"></div>
              <span className="text-gray-700">Prenotato</span>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Time Slots Grid */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="space-y-6">
            {slotsByHour.map(({ hour, slots }) => (
              <div key={hour} className="flex items-start gap-4">
                {/* Hour Label */}
                <div className="flex flex-col items-center justify-center w-20 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl border-2 border-gray-200 shadow-sm">
                  <div className="text-xl font-bold text-gray-800">
                    {hour.toString().padStart(2, '0')}
                  </div>
                  <div className="text-xs text-gray-600 font-medium">
                    {hour < 12 ? 'AM' : 'PM'}
                  </div>
                </div>
                
                {/* Slots for this hour */}
                <div className="flex gap-3 flex-1 flex-wrap">
                  {slots.map(slot => {
                    const state = getSlotState(slot.startTime, slot.endTime);
                    const bookingInfo = getBookingInfo(slot.startTime, slot.endTime);
                    
                    return (
                      <div
                        key={`${slot.startTime}-${slot.endTime}`}
                        className={getSlotStyles(state)}
                        onClick={() => handleSlotClick(slot.startTime, slot.endTime)}
                        title={
                          state === 'booked' && bookingInfo
                            ? `Prenotato da ${bookingInfo.student.username || bookingInfo.student.email}`
                            : `${slot.startTime} - ${slot.endTime}`
                        }
                      >
                        <div className="text-base font-bold">
                          {slot.startTime}
                        </div>
                        <div className="text-xs opacity-90">
                          {slot.endTime}
                        </div>
                        
                        {/* Status icons */}
                        {state === 'booked' && (
                          <div className="absolute top-1 right-1">
                            <User className="w-3 h-3" />
                          </div>
                        )}
                        {state === 'saved' && (
                          <div className="absolute top-1 right-1">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Selection Summary */}
      {selectedSlots.length > 0 && (
        <Card className="mb-6 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-bold text-blue-900 flex items-center gap-2">
                <Check className="w-5 h-5" />
                Slot Selezionati ({selectedSlots.length})
              </h4>
              <Button
                variant="outline"
                size="sm"
                onClick={clearSelection}
                className="text-blue-700 border-blue-300 hover:bg-blue-200"
              >
                <X className="w-4 h-4 mr-2" />
                Pulisci Selezione
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
              {selectedSlots
                .sort((a, b) => a.startTime.localeCompare(b.startTime))
                .map(slot => (
                  <Badge 
                    key={slot.id} 
                    className="bg-white text-blue-800 border border-blue-300 p-3 text-center font-semibold hover:bg-blue-50 transition-colors"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm">{slot.startTime}</span>
                      <span className="text-xs opacity-70">{slot.endTime}</span>
                    </div>
                  </Badge>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Submit Button */}
      {onSubmit && (
        <Card>
          <CardFooter className="p-6">
            <Button
              onClick={onSubmit}
              disabled={!canSubmit || isLoading || selectedSlots.length === 0}
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300"
              size="lg"
            >
              {isLoading && (
                <div className="w-5 h-5 mr-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
              )}
              <Check className="w-6 h-6 mr-3" />
              {submitLabel} ({selectedSlots.length} slot)
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}