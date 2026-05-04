import { createRoot } from "react-dom/client";
import React from "react";
import { BrowserRouter } from "react-router";
import "./app.css";
import App from "./App";

const container = document.getElementById("root");
if (!container) throw new Error("Root element not found");

const root = createRoot(container);
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
);
