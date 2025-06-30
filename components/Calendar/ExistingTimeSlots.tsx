import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Check, X, Users, CalendarIcon, Repeat, Loader2 } from "lucide-react";
import { type TimeSlotWithBookings } from "@/hooks/use-toast";

interface ExistingTimeSlotsProps {
  timeSlots: TimeSlotWithBookings[];
  selectedDate?: Date;
  loading: boolean;
  onToggleSlotActive: (timeSlotId: number) => Promise<void>;
  onDeleteTimeSlot: (timeSlotId: number) => Promise<void>;
}

export function ExistingTimeSlots({
  timeSlots,
  selectedDate,
  loading,
  onToggleSlotActive,
  onDeleteTimeSlot,
}: ExistingTimeSlotsProps) {
  const getBookingForTimeSlot = (timeSlot: TimeSlotWithBookings) => {
    return timeSlot.bookings.find((booking) => booking.status !== "CANCELLED");
  };

  const availableCount = timeSlots.filter(
    (slot) => slot.isActive && !getBookingForTimeSlot(slot)
  ).length;

  const bookedCount = timeSlots.filter((slot) =>
    getBookingForTimeSlot(slot)
  ).length;

  return (
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
        ) : timeSlots.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CalendarIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nessuna disponibilità</p>
          </div>
        ) : (
          <div className="space-y-2">
            {timeSlots
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
                          !isBooked && onToggleSlotActive(slot.id)
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
                          onClick={() => onDeleteTimeSlot(slot.id)}
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
  );
}