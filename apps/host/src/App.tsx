import React from "react";
import { ShellLayout } from "./components/shell-layout";
import { AppRoutes } from "./routes";

export default function App() {
  return (
    <ShellLayout>
      <AppRoutes />
    </ShellLayout>
  );
}
