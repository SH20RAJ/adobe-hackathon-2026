import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "outline" | "ghost" | "link" | "destructive" | "adobe";
  size?: "default" | "sm" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const base = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EB1000] focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 cursor-pointer active:scale-[0.99]";
    
    const variants = {
      default: "bg-[#EB1000] text-white hover:bg-[#D40F00] shadow-sm",
      adobe: "bg-[#EB1000] text-white hover:bg-[#D40F00] shadow-sm",
      secondary: "bg-[#282828] text-white hover:bg-[#323232] border border-[#333333]",
      outline: "border border-border bg-[#181818] text-white hover:bg-[#242424] hover:border-[#3E3E3E]",
      ghost: "text-muted-foreground hover:text-white hover:bg-[#222222]",
      link: "text-[#EB1000] underline-offset-4 hover:underline",
      destructive: "bg-[#EB1000] text-white hover:bg-[#D40F00] shadow-sm",
    };

    const sizes = {
      default: "h-9 px-4 py-2",
      sm: "h-7 rounded px-3 text-[11px]",
      lg: "h-11 rounded-md px-6 text-sm",
      icon: "h-9 w-9 rounded-md",
    };

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
