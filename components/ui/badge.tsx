import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "outline";
}

export const Badge = ({
  className,
  variant = "default",
  ...props
}: BadgeProps) => {
  const styles = {
    default: "bg-primary text-primary-foreground",
    secondary: "bg-success text-success-foreground",
    outline: "border",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        styles[variant],
        className
      )}
      {...props}
    />
  );
};
