import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "destructive" | "success" | "warning" | "indigo" | "adobe";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "bg-[#EB1000]/15 text-[#EB1000] border-[#EB1000]/30",
    adobe: "bg-[#EB1000]/15 text-[#EB1000] border-[#EB1000]/30",
    secondary: "bg-[#242424] text-muted-foreground border-border",
    outline: "text-white border-[#383838]",
    destructive: "bg-[#EB1000]/20 text-[#FF5252] border-[#EB1000]/40 font-bold",
    success: "bg-[#27C281]/15 text-[#27C281] border-[#27C281]/30 font-medium",
    warning: "bg-[#E68619]/15 text-[#FFA033] border-[#E68619]/30 font-medium",
    indigo: "bg-[#1473E6]/15 text-[#4FA5FF] border-[#1473E6]/30 font-medium",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold transition-colors focus:outline-none",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
