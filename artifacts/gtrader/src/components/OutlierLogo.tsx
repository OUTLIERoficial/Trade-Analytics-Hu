import { cn } from "@/lib/utils";

interface OutlierLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function OutlierLogoMark({ size = "md", className }: OutlierLogoProps) {
  const sizes = {
    sm: { outer: "w-8 h-8 rounded-[8px] text-[10px] tracking-[0.18em]" },
    md: { outer: "w-10 h-10 rounded-[10px] text-[11px] tracking-[0.2em]" },
    lg: { outer: "w-14 h-14 rounded-[14px] text-[13px] tracking-[0.22em]" },
  };
  return (
    <div
      className={cn(
        "flex-shrink-0 flex items-center justify-center font-black text-white select-none",
        sizes[size].outer,
        className,
      )}
      style={{
        background: "radial-gradient(ellipse at 35% 20%, hsl(249 100% 55% / 0.95) 0%, hsl(230 60% 12%) 65%)",
        boxShadow: "0 3px 16px hsl(249 100% 60% / 0.3), inset 0 1px 0 hsl(249 100% 90% / 0.12)",
      }}
    >
      O
    </div>
  );
}
