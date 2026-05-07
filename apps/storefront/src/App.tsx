import React from "react";
import { Route, Routes } from "react-router";
import {
  ProductListPage,
  ProductDetailPage,
  CartPage,
  CheckoutPage,
} from "./pages";

export default function App() {
  return (
    <Routes>
      <Route index element={<ProductListPage />} />
      <Route path=":id" element={<ProductDetailPage />} />
      <Route path="cart" element={<CartPage />} />
      <Route path="checkout" element={<CheckoutPage />} />
    </Routes>
  );
}
