import React from "react";
import { Route, Routes } from "react-router";
import { OrdersPage, OrderDetailPage } from "./pages";

export default function OrdersApp() {
  return (
    <Routes>
      <Route index element={<OrdersPage />} />
      <Route path=":id" element={<OrderDetailPage />} />
    </Routes>
  );
}
