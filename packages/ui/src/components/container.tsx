import * as React from "react";
import { cn } from "../lib/utils";

type ContainerSize = "sm" | "md" | "lg" | "xl";

const sizeMap: Record<ContainerSize, string> = {
  sm: "max-w-screen-sm",
  md: "max-w-screen-md",
  lg: "max-w-screen-lg",
  xl: "max-w-screen-xl",
};

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: ContainerSize;
}

function Container({ size = "xl", className, ...props }: ContainerProps) {
  return (
    <div
      className={cn("mx-auto w-full px-4", sizeMap[size], className)}
      {...props}
    />
  );
}

export { Container };
