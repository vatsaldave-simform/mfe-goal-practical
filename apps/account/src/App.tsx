import React from "react";
import { Route, Routes } from "react-router";
import "./app.css";
import { ProfilePage } from "./pages";

export default function App() {
  return (
    <Routes>
      <Route index element={<ProfilePage />} />
    </Routes>
  );
}
