"use client";

import { useState, useTransition } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { togglePackageStatus } from "@/app/actions/teacherActions/createPackagesActions";
import { toast } from "sonner";

// ✅ Interfaccia corretta con 'name'
interface TogglePackageButtonProps {
  packageId: number;
  isActive: boolean;
  name: string;
  variant?: "switch" | "button";
}

export function TogglePackageButton({
  packageId,
  isActive: initialIsActive,
  name, // ✅ Ora è incluso nell'interfaccia
  variant = "switch"
}: TogglePackageButtonProps) {
  const [isActive, setIsActive] = useState(initialIsActive);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    const newStatus = !isActive;
    
    // Optimistic update
    setIsActive(newStatus);
    
    startTransition(async () => {
      try {
        const result = await togglePackageStatus(packageId);
        
        if (!result.success) {
          // Revert on error
          setIsActive(!newStatus);
          toast.error(result.message || "Errore durante l'aggiornamento");
        } else {
          toast.success(
            `Pacchetto "${name}" ${newStatus ? "attivato" : "disattivato"}`
          );
        }
      } catch  {
        // Revert on error
        setIsActive(!newStatus);
        toast.error("Errore durante l'aggiornamento");
      }
    });
  };

  if (variant === "switch") {
    return (
      <div className="flex items-center space-x-2">
        <Switch
          checked={isActive}
          onCheckedChange={handleToggle}
          disabled={isPending}
        />
        <span className="text-sm text-muted-foreground">
          {isActive ? "Attivo" : "Disattivo"}
        </span>
        {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
      </div>
    );
  }

  return (
    <Button
      variant={isActive ? "default" : "secondary"}
      size="sm"
      onClick={handleToggle}
      disabled={isPending}
    >
      {isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
      {isActive ? "Disattiva" : "Attiva"}
    </Button>
  );
}