import { useEffect } from "react";
import { useCart } from "@mfe/api";
import { useStore } from "@mfe/store";

/**
 * Headless component that keeps the global store's `itemCount` in sync with
 * the server-side cart.  It subscribes to the `useCart` query (which is
 * invalidated by every cart mutation in the storefront) and writes the
 * authoritative `itemCount` from the server into the store whenever it
 * changes.  Mount this once inside the shell so the navbar badge is always
 * accurate — on initial load, after add/update/remove, and across MF
 * boundaries.
 */
export function CartCountSyncer() {
  const isAuthenticated = useStore((s) => s.isAuthenticated);
  const setCartCount = useStore((s) => s.setCartCount);

  const { data: cart } = useCart({ enabled: isAuthenticated });

  useEffect(() => {
    if (cart !== undefined) {
      setCartCount(cart.itemCount);
    }
  }, [cart, setCartCount]);

  return null;
}
