import { useStore } from "@mfe/store";

/**
 * Returns a stable `syncCartCount` callback that writes the latest cart item
 * count to the global Zustand store via `getState()` (no subscription, no
 * re-render).  Call it from any mutation's `onSuccess` handler that receives
 * a cart response with an `itemCount` field.
 *
 * @example
 * const { syncCartCount } = useCartSync();
 * addToCart.mutate({ productId, quantity: 1 }, { onSuccess: (cart) => syncCartCount(cart.itemCount) });
 */
export function useCartSync() {
  function syncCartCount(itemCount: number): void {
    useStore.getState().setCartCount(itemCount);
  }

  return { syncCartCount };
}
