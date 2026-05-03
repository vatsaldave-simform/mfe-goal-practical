import type { StateCreator } from "zustand";
import type { AuthSlice, StoreState } from "../types";

export const createAuthSlice: StateCreator<StoreState, [], [], AuthSlice> = (
  set,
) => ({
  isAuthenticated: false,
  user: null,
  setAuth: (user) => set({ isAuthenticated: true, user }),
  clearAuth: () => set({ isAuthenticated: false, user: null }),
});
