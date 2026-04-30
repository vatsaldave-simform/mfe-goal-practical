import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
