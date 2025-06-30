"use client";
import * as React from "react";
import { type DateRange } from "react-day-picker";

import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Calendar as CalendarIcon,
  Repeat,
} from "lucide-react";

const weekDays = [
  { value: 0, label: "Domenica" },
  { value: 1, label: "Lunedì" },
  { value: 2, label: "Martedì" },
  { value: 3, label: "Mercoledì" },
  { value: 4, label: "Giovedì" },
  { value: 5, label: "Venerdì" },
  { value: 6, label: "Sabato" },
];

export interface DateSelectionManagerProps {
  mode: "single" | "range";
  selectedDate?: Date;
  onSelectedDateChange: (date: Date | undefined) => void;
  dateRange?: DateRange;
  onDateRangeChange: (range: DateRange | undefined) => void;
  selectedDays: number[];
  onSelectedDaysChange: (days: number[]) => void;
  templateName: string;
  onTemplateNameChange: (name: string) => void;
  hasAvailability: (date: Date) => boolean;
  onMonthChange: (month: Date) => void;
}

export function DateSelectionManager({
  mode,
  selectedDate,
  onSelectedDateChange,
  dateRange,
  onDateRangeChange,
  selectedDays,
  onSelectedDaysChange,
  templateName,
  onTemplateNameChange,
  hasAvailability,
  onMonthChange,
}: DateSelectionManagerProps) {
  const toggleDay = (dayValue: number) => {
    const newSelectedDays = selectedDays.includes(dayValue) 
      ? selectedDays.filter(val => val !== dayValue)
      : [...selectedDays, dayValue];
    onSelectedDaysChange(newSelectedDays);
  };

  // Calcola il numero di giorni tra due date, inclusi entrambi i giorni
  const getDateRangeDays = (dateRange: DateRange | undefined): number => {
    if (!dateRange?.from || !dateRange?.to) return 0;
    const timeDiff = dateRange.to.getTime() - dateRange.from.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
  };

  if (mode === "single") {
    return (
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
            onSelect={onSelectedDateChange}
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
            onMonthChange={onMonthChange}
          />
        </CardContent>
      </Card>
    );
  }

  return (
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
            onSelect={onDateRangeChange}
            numberOfMonths={2}
            className="rounded-lg border shadow-sm"
            disabled={(date) => date < new Date()}
            showOutsideDays={false} 
            onMonthChange={onMonthChange}
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
              onChange={(e) => onTemplateNameChange(e.target.value)}
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
  );
}