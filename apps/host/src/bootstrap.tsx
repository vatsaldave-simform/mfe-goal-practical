import { createRoot } from "react-dom/client";
import React from "react";
import { BrowserRouter } from "react-router";
import { ApiProvider } from "@mfe/api";
import "./app.css";
import App from "./App";
import { AuthInitializer } from "./components/auth-initializer";

const container = document.getElementById("root");
if (!container) throw new Error("Root element not found");

const root = createRoot(container);
root.render(
  <ApiProvider>
    <BrowserRouter>
      <AuthInitializer>
        <App />
      </AuthInitializer>
    </BrowserRouter>
  </ApiProvider>,
);
