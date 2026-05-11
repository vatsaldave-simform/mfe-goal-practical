import React from "react";
import { Route, Routes } from "react-router";
import { CartPage, CheckoutPage } from "./pages";

export default function App() {
  return (
    <Routes>
      <Route index element={<CartPage />} />
      <Route path="checkout" element={<CheckoutPage />} />
    </Routes>
  );
}
