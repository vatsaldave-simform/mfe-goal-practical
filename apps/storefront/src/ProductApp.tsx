import React from "react";
import { Route, Routes } from "react-router";
import {
  CartPage,
  CheckoutPage,
  ProductDetailPage,
  ProductListPage,
} from "./pages";

export default function ProductApp() {
  return (
    <Routes>
      <Route index element={<ProductListPage />} />
      <Route path=":id" element={<ProductDetailPage />} />
    </Routes>
  );
}
