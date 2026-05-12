import { createRoot } from "react-dom/client";
import React from "react";
import { BrowserRouter, Link, Route } from "react-router";
import { ApiProvider } from "@mfe/api";
import "./app.css";
import App from "./App";
import CartApp from "./CartApp";

const container = document.getElementById("root");
if (!container) throw new Error("Root element not found");

const root = createRoot(container);
root.render(
  <BrowserRouter>
    <ApiProvider>
      <App />
    </ApiProvider>
  </BrowserRouter>,
);
