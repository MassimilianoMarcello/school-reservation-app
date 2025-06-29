

"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Clock,
  Check,
  X,
  Plus,
  Calendar as CalendarIcon,
  Users,
  Repeat,
  Edit,
  Loader2,
} from "lucide-react";
// import { useToast } from "@/hooks/use-toast"
import { toast } from "sonner";

// Import corretto delle server actions
import {
  getTeacherTimeSlotsForDate,
  createManualTimeSlot,
  createTemplateTimeSlots,
  deleteTimeSlot,
  toggleTimeSlotActive,
  type TimeSlotWithBookings,
  type CreateManualSlotData,
  type CreateTemplateData,
} from "@/hooks/use-toast";
// interface RawTimeSlotData {
//   id: number;
//   startTime: string;
//   endTime: string;
//   duration: number;
//   isActive: boolean;
//   source: string;
//   bookings: RawBookingData[];
// }

// interface RawBookingData {
//   id: number;
//   status: string;
//   student: {
//     id: number;
//     username?: string;
//     email?: string;
//   };
// }

const weekDays = [
  { value: 0, label: "Domenica" },
  { value: 1, label: "Lunedì" },
  { value: 2, label: "Martedì" },
  { value: 3, label: "Mercoledì" },
  { value: 4, label: "Giovedì" },
  { value: 5, label: "Venerdì" },
  { value: 6, label: "Sabato" },
];

export default function TeacherAvailabilityCalendar() {
  // const { toast } = useToast()
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [timeSlots, setTimeSlots] = React.useState<TimeSlotWithBookings[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
  const [createMode, setCreateMode] = React.useState<"manual" | "template">(
    "manual"
  );

  // Form states
  const [manualForm, setManualForm] = React.useState({
    startTime: "09:00",
    duration: 30,
  });

  const [templateForm, setTemplateForm] = React.useState({
    name: "",
    weekDays: [] as number[],
    startTime: "09:00",
    endTime: "18:00",
    duration: 30,
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });

  // Load time slots when date changes
  React.useEffect(() => {
    if (date) {
      loadTimeSlots(date);
    }
  }, [date]);

const loadTimeSlots = async (selectedDate: Date) => {
  try {
    setLoading(true);
    const result = await getTeacherTimeSlotsForDate(selectedDate);

    if (result.success && result.data) {
      // Semplicemente usa i dati così come arrivano dal server
      // TypeScript inferirà automaticamente i tipi corretti
      setTimeSlots(
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
};

  // Utility functions
  const calculateEndTime = (startTime: string, duration: number) => {
    const [hours, minutes] = startTime.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes + duration;
    const newHours = Math.floor(totalMinutes / 60);
    const newMinutes = totalMinutes % 60;
    return `${newHours.toString().padStart(2, "0")}:${newMinutes.toString().padStart(2, "0")}`;
  };

  const getBookingForTimeSlot = (timeSlot: TimeSlotWithBookings) => {
    return timeSlot.bookings.find((booking) => booking.status !== "CANCELLED");
  };

  // Handler functions
  const handleCreateManualSlot = async () => {
    if (!date) return;

    try {
      setLoading(true);
      const data: CreateManualSlotData = {
        date: date,
        startTime: manualForm.startTime,
        duration: manualForm.duration,
      };

      const result = await createManualTimeSlot(data);

      if (result.success) {
        toast("Time slot creato con successo");

        setIsCreateDialogOpen(false);
        setManualForm({ startTime: "09:00", duration: 30 });
        await loadTimeSlots(date);
      } else {
        toast("Errore nella creazione del time slot");
      }
    } catch {
      toast("Errore nella creazione del time slot");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async () => {
    if (templateForm.weekDays.length === 0 || !templateForm.name) {
      toast("Seleziona almeno un giorno e inserisci un nome per il template!");
      return;
    }

    try {
      setLoading(true);
      const data: CreateTemplateData = {
        name: templateForm.name,
        weekDays: templateForm.weekDays,
        startTime: templateForm.startTime,
        endTime: templateForm.endTime,
        duration: templateForm.duration,
        startDate: templateForm.startDate,
        endDate: templateForm.endDate,
      };

      const result = await createTemplateTimeSlots(data);

      if (result.success && result.data) {
        toast(
          result.data.message,
        );

        setIsCreateDialogOpen(false);
        setTemplateForm({
          name: "",
          weekDays: [],
          startTime: "09:00",
          endTime: "18:00",
          duration: 30,
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        });

        if (date) {
          await loadTimeSlots(date);
        }
      } else {
        toast("Errore nella creazione del template",
      
        );
      }
    } catch (error) {
      toast(
          error instanceof Error
            ? error.message
            : "Errore nella creazione del template",
    
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTimeSlot = async (timeSlotId: number) => {
    const timeSlot = timeSlots.find((slot) => slot.id === timeSlotId);
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
        toast( result.message || "Time slot eliminato con successo",
        );

        if (date) {
          await loadTimeSlots(date);
        }
      } else {
        toast( result.error || "Errore nell'eliminazione del time slot",
        
        );
      }
    } catch (error) {
      toast(
          error instanceof Error
            ? error.message
            : "Errore nell'eliminazione del time slot",
     
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
        if (date) {
          await loadTimeSlots(date);
        }
      } else {
        toast(
        result.error || "Errore nel toggle del time slot",
        
        );
      }
    } catch (error) {
      toast(
          error instanceof Error
            ? error.message
            : "Errore nel toggle del time slot",
     
      );
    } finally {
      setLoading(false);
    }
  };

  // Computed values
  const availableCount = timeSlots.filter(
    (slot) => slot.isActive && !getBookingForTimeSlot(slot)
  ).length;

  const bookedCount = timeSlots.filter((slot) =>
    getBookingForTimeSlot(slot)
  ).length;

  // Time options for forms
  const timeOptions = Array.from({ length: 19 }, (_, i) => {
    const hour = Math.floor(i / 2) + 9;
    const minute = (i % 2) * 30;
    return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
  });

  return (
    <Card className="gap-0 p-0 max-w-6xl mx-auto">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            <CardTitle>Gestione Disponibilità Insegnante</CardTitle>
          </div>

          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button size="sm" disabled={loading}>
                <Plus className="w-4 h-4 mr-2" />
                Crea Disponibilità
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Crea Nuove Disponibilità</DialogTitle>
              </DialogHeader>

              <Tabs
                value={createMode}
                onValueChange={(v) => setCreateMode(v as "manual" | "template")}
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger
                    value="manual"
                    className="flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Manuale
                  </TabsTrigger>
                  <TabsTrigger
                    value="template"
                    className="flex items-center gap-2"
                  >
                    <Repeat className="w-4 h-4" />
                    Template
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="manual" className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    Crea un singolo time slot per la data selezionata:{" "}
                    {date?.toLocaleDateString("it-IT")}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Orario Inizio</Label>
                      <Select
                        value={manualForm.startTime}
                        onValueChange={(value) =>
                          setManualForm((prev) => ({
                            ...prev,
                            startTime: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {timeOptions.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Durata</Label>
                      <Select
                        value={manualForm.duration.toString()}
                        onValueChange={(value) =>
                          setManualForm((prev) => ({
                            ...prev,
                            duration: parseInt(value),
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30">30 minuti</SelectItem>
                          <SelectItem value="60">60 minuti</SelectItem>
                          <SelectItem value="90">90 minuti</SelectItem>
                          <SelectItem value="120">120 minuti</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label>Orario Fine (automatico)</Label>
                    <Input
                      value={calculateEndTime(
                        manualForm.startTime,
                        manualForm.duration
                      )}
                      disabled
                      className="bg-muted"
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={() => setIsCreateDialogOpen(false)}
                      variant="outline"
                      className="flex-1"
                      disabled={loading}
                    >
                      Annulla
                    </Button>
                    <Button
                      onClick={handleCreateManualSlot}
                      className="flex-1"
                      disabled={!date || loading}
                    >
                      {loading && (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      )}
                      Crea Slot
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="template" className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    Crea time slots ricorrenti per giorni e orari specifici
                  </div>

                  <div>
                    <Label>Nome Template</Label>
                    <Input
                      value={templateForm.name}
                      onChange={(e) =>
                        setTemplateForm((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="es. Lezioni pomeridiane"
                    />
                  </div>

                  <div>
                    <Label>Giorni della settimana</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {weekDays.map((day) => (
                        <div
                          key={day.value}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`day-${day.value}`}
                            checked={templateForm.weekDays.includes(day.value)}
                            onCheckedChange={(checked) => {
                              setTemplateForm((prev) => ({
                                ...prev,
                                weekDays: checked
                                  ? [...prev.weekDays, day.value]
                                  : prev.weekDays.filter(
                                      (d) => d !== day.value
                                    ),
                              }));
                            }}
                          />
                          <Label
                            htmlFor={`day-${day.value}`}
                            className="text-sm"
                          >
                            {day.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Ora Inizio</Label>
                      <Input
                        type="time"
                        value={templateForm.startTime}
                        onChange={(e) =>
                          setTemplateForm((prev) => ({
                            ...prev,
                            startTime: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label>Ora Fine</Label>
                      <Input
                        type="time"
                        value={templateForm.endTime}
                        onChange={(e) =>
                          setTemplateForm((prev) => ({
                            ...prev,
                            endTime: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label>Durata Slot</Label>
                      <Select
                        value={templateForm.duration.toString()}
                        onValueChange={(value) =>
                          setTemplateForm((prev) => ({
                            ...prev,
                            duration: parseInt(value),
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30">30 min</SelectItem>
                          <SelectItem value="60">60 min</SelectItem>
                          <SelectItem value="90">90 min</SelectItem>
                          <SelectItem value="120">120 min</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Data Inizio</Label>
                      <Input
                        type="date"
                        value={
                          templateForm.startDate.toISOString().split("T")[0]
                        }
                        onChange={(e) =>
                          setTemplateForm((prev) => ({
                            ...prev,
                            startDate: new Date(e.target.value),
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label>Data Fine</Label>
                      <Input
                        type="date"
                        value={templateForm.endDate.toISOString().split("T")[0]}
                        onChange={(e) =>
                          setTemplateForm((prev) => ({
                            ...prev,
                            endDate: new Date(e.target.value),
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={() => setIsCreateDialogOpen(false)}
                      variant="outline"
                      className="flex-1"
                      disabled={loading}
                    >
                      Annulla
                    </Button>
                    <Button
                      onClick={handleCreateTemplate}
                      className="flex-1"
                      disabled={loading}
                    >
                      {loading && (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      )}
                      Crea Template
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent className="relative p-0 lg:pr-96">
        <div className="p-6">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            defaultMonth={date}
            showOutsideDays={false}
            className="bg-transparent p-0 [--cell-size:--spacing(10)] md:[--cell-size:--spacing(12)]"
            formatters={{
              formatWeekdayName: (date) => {
                return date.toLocaleString("it-IT", { weekday: "short" });
              },
            }}
          />
        </div>

        <div className="inset-y-0 right-0 flex max-h-96 w-full flex-col border-t p-6 lg:absolute lg:max-h-none lg:w-96 lg:border-t-0 lg:border-l">
          {date ? (
            <>
              <div className="mb-4">
                <h3 className="font-semibold mb-2">
                  {date.toLocaleDateString("it-IT", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </h3>
                <div className="flex gap-2 text-sm">
                  <Badge
                    variant="default"
                    className="bg-green-100 text-green-800"
                  >
                    <CalendarIcon className="w-3 h-3 mr-1" />
                    {availableCount} liberi
                  </Badge>
                  <Badge variant="destructive">
                    <Users className="w-3 h-3 mr-1" />
                    {bookedCount} prenotati
                  </Badge>
                </div>
              </div>

              <div className="no-scrollbar overflow-y-auto scroll-pb-6">
                {loading ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin" />
                    <p className="text-sm text-muted-foreground">
                      Caricamento...
                    </p>
                  </div>
                ) : timeSlots.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CalendarIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nessuna disponibilità</p>
                    <p className="text-xs">Crea nuovi time slots</p>
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
                                  {booking.student.username ||
                                    booking.student.email}
                                </div>
                                <div className="text-red-600">
                                  {booking.status}
                                </div>
                              </div>
                            )}

                            {!slot.isActive && !booking && (
                              <div className="ml-2 p-1 bg-gray-50 rounded text-xs text-gray-600">
                                Slot disattivato
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-32 text-muted-foreground">
              <div className="text-center">
                <CalendarIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Seleziona una data</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-4 border-t px-6 !py-5 md:flex-row">
        <div className="text-sm flex-1">
          {date ? (
            <div className="space-y-1">
              <div className="font-medium">Riepilogo giornata:</div>
              <div className="text-muted-foreground">
                {timeSlots.length > 0
                  ? `${timeSlots.length} slot totali • ${availableCount} disponibili • ${bookedCount} prenotati`
                  : "Nessuna disponibilità programmata"}
              </div>
            </div>
          ) : (
            "Seleziona una data per gestire le tue disponibilità."
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
