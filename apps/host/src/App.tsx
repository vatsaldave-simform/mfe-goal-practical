import React from "react";
import { Toaster } from "@mfe/ui";
import { ShellLayout } from "./components/shell-layout";
import { AppRoutes } from "./routes";

export default function App() {
  return (
    <>
      <ShellLayout>
        <AppRoutes />
      </ShellLayout>
      <Toaster />
    </>
  );
}
