import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: string;
  trendUp?: boolean;
  className?: string;
}

export function StatCard({ title, value, icon, trend, trendUp, className }: StatCardProps) {
  return (
    <div className={cn(
      "p-6 rounded-2xl bg-card border border-border/50 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-primary/20",
      className
    )}>
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 rounded-xl bg-primary/10 text-primary">
          {icon}
        </div>
        {trend && (
          <span className={cn(
            "text-xs font-semibold px-2 py-1 rounded-full",
            trendUp 
              ? "bg-green-500/10 text-green-500" 
              : "bg-red-500/10 text-red-500"
          )}>
            {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
        <h3 className="text-2xl font-bold font-display tracking-tight text-foreground">{value}</h3>
      </div>
    </div>
  );
}
