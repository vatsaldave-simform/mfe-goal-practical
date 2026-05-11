import React from "react";
import { PageContainer } from "@mfe/ui";
import { Navbar } from "./navbar";

interface ShellLayoutProps {
  children: React.ReactNode;
}

export function ShellLayout({ children }: ShellLayoutProps) {
  return (
    <div className="flex h-svh flex-col overflow-hidden">
      <Navbar />
      <main className="flex-1 overflow-auto">
        <PageContainer>{children}</PageContainer>
      </main>
    </div>
  );
}
