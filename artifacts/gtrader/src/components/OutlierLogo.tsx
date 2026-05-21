import { cn } from "@/lib/utils";

interface OutlierLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function OutlierLogoMark({ size = "md", className }: OutlierLogoProps) {
  const px = { sm: "w-8 h-8 rounded-[8px]", md: "w-10 h-10 rounded-[10px]", lg: "w-14 h-14 rounded-[14px]" };
  return (
    <img
      src="/outlier-logo.png"
      alt="OUTLIER"
      className={cn("flex-shrink-0 object-cover select-none", px[size], className)}
    />
  );
}
