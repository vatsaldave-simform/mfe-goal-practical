import React from "react";
import { Route, Routes } from "react-router";
import "./app.css";
import { LoginPage, RegisterPage, ProfilePage } from "./pages";

export default function App() {
  return (
    <Routes>
      <Route path="login" element={<LoginPage />} />
      <Route path="register" element={<RegisterPage />} />
      <Route path="profile" element={<ProfilePage />} />
    </Routes>
  );
}
