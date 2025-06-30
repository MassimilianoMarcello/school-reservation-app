import { Calendar as CalendarIcon } from "lucide-react";

interface TeacherAvailabilityHeaderProps {
  title?: string;
  subtitle?: string;
}

export function TeacherAvailabilityHeader({ 
  title = "Gestione Disponibilità Lezioni",
  subtitle = "Crea le tue disponibilità per singole date o con template ricorrenti"
}: TeacherAvailabilityHeaderProps) {
  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <CalendarIcon className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              {title}
            </h1>
            <p className="text-sm text-gray-600">
              {subtitle}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}