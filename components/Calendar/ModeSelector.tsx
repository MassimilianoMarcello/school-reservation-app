import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit, Repeat } from "lucide-react";

interface ModeSelectorProps {
  mode: "single" | "range";
  onModeChange: (mode: "single" | "range") => void;
}

export function ModeSelector({ mode, onModeChange }: ModeSelectorProps) {
  return (
    <div className="mb-8">
      <Tabs value={mode} onValueChange={(v) => onModeChange(v as "single" | "range")}>
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
      </Tabs>
    </div>
  );
}