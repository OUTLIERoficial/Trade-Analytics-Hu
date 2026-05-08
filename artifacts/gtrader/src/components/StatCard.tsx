import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  trend?: "up" | "down" | "neutral";
  variant?: "profit" | "loss" | "primary" | "gold" | "default";
  className?: string;
  icon?: React.ElementType;
  "data-testid"?: string;
}

export default function StatCard({
  label, value, sub, trend, variant = "default", className,
  icon: Icon, "data-testid": testId,
}: StatCardProps) {
  const variantClass = {
    profit: "stat-card-profit",
    loss: "stat-card-loss",
    primary: "stat-card-primary",
    gold: "stat-card-gold",
    default: "bg-card border border-card-border",
  }[variant];

  return (
    <div className={cn("rounded-xl p-4 space-y-2 transition-all", variantClass, className)} data-testid={testId}>
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{label}</p>
        {Icon && <div className="w-7 h-7 rounded-md bg-muted/60 flex items-center justify-center">
          <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        </div>}
      </div>
      <div className="flex items-end justify-between">
        <p className={cn(
          "text-2xl font-black leading-none tracking-tight",
          variant === "profit" && "text-profit",
          variant === "loss" && "text-loss",
          variant === "gold" && "gold-gradient",
          (variant === "default" || variant === "primary") && "text-foreground",
        )}>{value}</p>
        {trend && (
          <div className={cn(
            "flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-full",
            trend === "up" && "bg-profit text-profit",
            trend === "down" && "bg-loss text-loss",
            trend === "neutral" && "bg-muted text-muted-foreground",
          )}>
            {trend === "up" && <TrendingUp className="h-3 w-3" />}
            {trend === "down" && <TrendingDown className="h-3 w-3" />}
            {trend === "neutral" && <Minus className="h-3 w-3" />}
          </div>
        )}
      </div>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}
