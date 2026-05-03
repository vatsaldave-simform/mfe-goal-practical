import { create } from "zustand";
import { createAuthSlice } from "./slices/auth";
import { createCartSlice } from "./slices/cart";
import type { StoreState } from "./types";

export const useStore = create<StoreState>()((...a) => ({
  ...createAuthSlice(...a),
  ...createCartSlice(...a),
}));

export type { AuthSlice, CartSlice, StoreState } from "./types";
