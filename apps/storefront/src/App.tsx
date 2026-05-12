import React from "react";
import { Route, Routes } from "react-router";
import { ProductListPage, ProductDetailPage, CartPage } from "./pages";
import ProductApp from "./ProductApp";
import CartApp from "./CartApp";

export default function App() {
  return (
    <Routes>
      <Route path="/products/*" element={<ProductApp />} />
      <Route path="/cart/*" element={<CartApp />} />
    </Routes>
  );
}
