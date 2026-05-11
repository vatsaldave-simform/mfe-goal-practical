import React from "react";
import { cn } from "../lib/utils";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <div className={cn("mx-auto w-full max-w-6xl px-4", className)}>
      {children}
    </div>
  );
}
