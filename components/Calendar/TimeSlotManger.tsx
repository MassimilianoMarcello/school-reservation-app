"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, Plus, X, ArrowRight, Check } from "lucide-react";

export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  duration: number;
}

interface TimeSlotManagerProps {
  timeSlots: TimeSlot[];
  onTimeSlotsChange: (timeSlots: TimeSlot[]) => void;
  onSubmit?: () => void;
  submitLabel?: string;
  canSubmit?: boolean;
  isLoading?: boolean;
  className?: string;
}

export function TimeSlotManager({
  timeSlots,
  onTimeSlotsChange,
  onSubmit,
  submitLabel = "Conferma Orari",
  canSubmit = true,
  isLoading = false,
  className = ""
}: TimeSlotManagerProps) {
  
  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 8; hour <= 20; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        times.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
      }
    }
    return times;
  };

  const timeOptions = generateTimeOptions();

  const calculateDuration = (startTime: string, endTime: string): number => {
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    return Math.round((end.getTime() - start.getTime()) / (1000 * 60));
  };

  const addTimeSlot = () => {
    const newSlot: TimeSlot = {
      id: Date.now().toString(),
      startTime: '09:00',
      endTime: '10:00',
      duration: 60
    };
    onTimeSlotsChange([...timeSlots, newSlot]);
  };

  const updateTimeSlot = (id: string, field: keyof TimeSlot, value: string) => {
    const updatedSlots = timeSlots.map(slot => {
      if (slot.id === id) {
        const updated = { ...slot, [field]: value };
        
        // Calculate duration when times change
        if (field === 'startTime' || field === 'endTime') {
          const start = field === 'startTime' ? value : slot.startTime;
          const end = field === 'endTime' ? value : slot.endTime;
          const duration = calculateDuration(start, end);
          updated.duration = duration;
        }
        
        return updated;
      }
      return slot;
    });
    
    onTimeSlotsChange(updatedSlots);
  };

  const removeTimeSlot = (id: string) => {
    const filteredSlots = timeSlots.filter(slot => slot.id !== id);
    onTimeSlotsChange(filteredSlots);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Orari Disponibili
          </CardTitle>
          <Button onClick={addTimeSlot} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Aggiungi Orario
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {timeSlots.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">Nessun orario selezionato</p>
            <p className="text-sm">Clicca Aggiungi Orario per iniziare</p>
          </div>
        ) : (
          <div className="space-y-4">
            {timeSlots.map(slot => (
              <div key={slot.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2 flex-1">
                  <Select
                    value={slot.startTime}
                    onValueChange={(value) => updateTimeSlot(slot.id, 'startTime', value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timeOptions.map(time => (
                        <SelectItem key={time} value={time}>{time}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                  
                  <Select
                    value={slot.endTime}
                    onValueChange={(value) => updateTimeSlot(slot.id, 'endTime', value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timeOptions.map(time => (
                        <SelectItem key={time} value={time}>{time}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Badge variant="outline" className="ml-2">
                    {slot.duration} min
                  </Badge>
                </div>
                
                <Button
                  onClick={() => removeTimeSlot(slot.id)}
                  variant="outline"
                  size="sm"
                  className="text-red-500 hover:bg-red-50"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      {onSubmit && (
        <CardFooter>
          <Button
            onClick={onSubmit}
            disabled={!canSubmit || isLoading || timeSlots.length === 0}
            className="w-full"
            size="lg"
          >
            {isLoading && <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />}
            <Check className="w-5 h-5 mr-2" />
            {submitLabel}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}