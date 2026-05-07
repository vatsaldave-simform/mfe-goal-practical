import { useNavigate } from "react-router";
import { useCart, useUpdateCartItem, useRemoveCartItem } from "@mfe/api";
import { Button, Separator, Skeleton } from "@mfe/ui";
import { formatCurrency } from "@mfe/shared";
import { CartItemRow } from "../components/CartItemRow";
import { useCartSync } from "../hooks/useCartSync";

export default function CartPage() {
  const navigate = useNavigate();
  const { syncCartCount } = useCartSync();

  const { data: cart, isPending, isError } = useCart();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();

  const isUpdating = updateItem.isPending || removeItem.isPending;

  function handleIncrease(id: string) {
    const item = cart?.items.find((i) => i.id === id);
    if (!item) return;
    updateItem.mutate(
      { id, quantity: item.quantity + 1 },
      { onSuccess: (updated) => syncCartCount(updated.itemCount) },
    );
  }

  function handleDecrease(id: string) {
    const item = cart?.items.find((i) => i.id === id);
    if (!item || item.quantity <= 1) return;
    updateItem.mutate(
      { id, quantity: item.quantity - 1 },
      { onSuccess: (updated) => syncCartCount(updated.itemCount) },
    );
  }

  function handleRemove(id: string) {
    const removedQty = cart?.items.find((i) => i.id === id)?.quantity ?? 1;
    removeItem.mutate(id, {
      onSuccess: () => {
        syncCartCount(
          Math.max(0, (cart?.itemCount ?? removedQty) - removedQty),
        );
      },
    });
  }

  if (isPending) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Your Cart</h1>
        {[1, 2, 3].map((n) => (
          <div key={n} className="flex gap-4 py-4">
            <Skeleton className="size-20 rounded-md shrink-0" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-3/4 rounded" />
              <Skeleton className="h-3 w-1/4 rounded" />
              <Skeleton className="mt-2 h-7 w-32 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="text-lg font-medium text-destructive">
          Failed to load cart. Please try again.
        </p>
        <Button variant="outline" onClick={() => navigate(0)}>
          Retry
        </Button>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="text-xl font-semibold">Your cart is empty</p>
        <p className="text-muted-foreground">
          Browse products and add something you like.
        </p>
        <Button onClick={() => navigate("/")}>Continue Shopping</Button>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      {/* Item list */}
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold mb-2">Your Cart</h1>
        <p className="text-muted-foreground text-sm mb-4">
          {cart.itemCount} {cart.itemCount === 1 ? "item" : "items"}
        </p>

        <div className="divide-y">
          {cart.items.map((item) => (
            <CartItemRow
              key={item.id}
              item={item}
              onIncrease={handleIncrease}
              onDecrease={handleDecrease}
              onRemove={handleRemove}
              isUpdating={isUpdating}
            />
          ))}
        </div>
      </div>

      {/* Cart summary */}
      <aside className="flex flex-col gap-4 rounded-lg border bg-card p-6 h-fit">
        <h2 className="font-semibold text-lg">Summary</h2>
        <Separator />
        <div className="flex items-center justify-between font-semibold">
          <span>Total</span>
          <span className="text-primary tabular-nums">
            {formatCurrency(cart.total)}
          </span>
        </div>
        <Button
          className="w-full"
          onClick={() => navigate("/checkout")}
          disabled={isUpdating}
        >
          Proceed to Checkout
        </Button>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => navigate("/")}
        >
          Continue Shopping
        </Button>
      </aside>
    </div>
  );
}
