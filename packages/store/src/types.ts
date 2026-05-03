import type { SafeUser } from '@mfe/shared';

export type AuthSlice = {
  isAuthenticated: boolean;
  user: SafeUser | null;
  setAuth: (user: SafeUser) => void;
  clearAuth: () => void;
};

export type CartSlice = {
  itemCount: number;
  setCartCount: (count: number) => void;
  clearCart: () => void;
};

export type StoreState = AuthSlice & CartSlice;
