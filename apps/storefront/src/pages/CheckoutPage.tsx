import { useNavigate } from "react-router";
import { useCart, useCreateOrder } from "@mfe/api";
import { Button, Skeleton, toast } from "@mfe/ui";
import { OrderSummary } from "../components/OrderSummary";
import { useCartSync } from "../hooks/useCartSync";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { syncCartCount } = useCartSync();

  // Cache hit from CartPage — no extra network request
  const { data: cart, isPending } = useCart();
  const createOrder = useCreateOrder();

  function handlePlaceOrder() {
    createOrder.mutate(undefined, {
      onSuccess: () => {
        toast.success("Order placed!");
        // Cart is cleared after order creation
        syncCartCount(0);
        navigate("/orders", { replace: true });
      },
      onError: (err) =>
        toast.error(
          (err as Error)?.message ?? "Something went wrong. Please try again.",
        ),
    });
  }

  if (isPending) {
    return (
      <div className="flex flex-col gap-4 max-w-md mx-auto">
        <Skeleton className="h-7 w-40 rounded" />
        <Skeleton className="h-48 w-full rounded-lg" />
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="text-xl font-semibold">Nothing to check out</p>
        <p className="text-muted-foreground">Your cart is empty.</p>
        <Button onClick={() => navigate("/")}>Browse Products</Button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Checkout</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Review your order before placing it.
        </p>
      </div>

      <OrderSummary
        cart={cart}
        actionLabel="Place Order"
        onAction={handlePlaceOrder}
        isLoading={createOrder.isPending}
        disabled={createOrder.isPending}
      />

      <Button
        variant="outline"
        className="w-full"
        onClick={() => navigate("/cart")}
        disabled={createOrder.isPending}
      >
        Back to Cart
      </Button>
    </div>
  );
}
