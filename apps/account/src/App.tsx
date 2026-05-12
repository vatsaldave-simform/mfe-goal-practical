import React from "react";
import { Route, Routes } from "react-router";
import "./app.css";
import { ProfilePage } from "./pages";
import AuthApp from "./AuthApp";
import OrdersApp from "./OrdersApp";

export default function App() {
  return (
    <Routes>
      <Route index element={<ProfilePage />} />
      <Route path="/auth/*" element={<AuthApp />} />
      <Route path="/orders/*" element={<OrdersApp />} />
    </Routes>
  );
}
