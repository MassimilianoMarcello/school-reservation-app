"use client";
import { Eclipse } from "lucide-react";
type TopFormHeaderProps = {
  title: string; 
  icon: React.ReactNode; 

  subtitle?: string; 
};

const TopFormHeader: React.FC<TopFormHeaderProps> = ({
  title,
  icon,
  subtitle,
}) => {
  return (
    <div>
      <div className="relative">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 flex items-center gap-1 text-sm text-muted-foreground">
          <span>auth </span> <Eclipse size={12} />
        </div>

        <div className="flex items-center justify-center gap-2">
          {icon}
          <h1 className="text-3xl font-bold">{title}</h1>
        </div>

        {subtitle && (
          <p className="text-muted-foreground text-center text-sm mt-2">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

export default TopFormHeader;
