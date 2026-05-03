import type { StateCreator } from "zustand";
import type { CartSlice, StoreState } from "../types";

export const createCartSlice: StateCreator<StoreState, [], [], CartSlice> = (
  set,
) => ({
  itemCount: 0,
  setCartCount: (count) => set({ itemCount: count }),
  clearCart: () => set({ itemCount: 0 }),
});
