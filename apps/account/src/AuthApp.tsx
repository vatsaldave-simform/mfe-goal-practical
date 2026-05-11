import React from "react";
import { Route, Routes } from "react-router";
import "./app.css";
import { LoginPage, RegisterPage } from "./pages";

export default function AuthApp() {
  return (
    <Routes>
      <Route path="login" element={<LoginPage />} />
      <Route path="register" element={<RegisterPage />} />
    </Routes>
  );
}
